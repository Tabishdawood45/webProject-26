const express = require('express');
const router = express.Router();
const pool = require('../db');

function generateOrderNumber() {
  return 'ORD-' + Date.now();
}

// Place order
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id, cart, shipping_address } = req.body;

    if (!user_id || !cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'User and cart items are required' });
    }

    await client.query('BEGIN');

    let total = 0;

    for (const item of cart) {
      const productCheck = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [item.id]
      );

      if (productCheck.rows.length === 0) {
        throw new Error(`Product not found: ${item.name}`);
      }

      const product = productCheck.rows[0];
      const quantity = Number(item.quantity) || 1;

      if (product.stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      total += Number(product.price) * quantity;
    }

    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, order_number, total_amount, status, estimated_delivery, shipping_address)
      VALUES ($1, $2, $3, 'pending', CURRENT_DATE + INTERVAL '5 days', $4)
      RETURNING *
      `,
      [user_id, orderNumber, total.toFixed(2), shipping_address || 'Default delivery address']
    );

    const order = orderResult.rows[0];

    for (const item of cart) {
      const quantity = Number(item.quantity) || 1;

      const productCheck = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [item.id]
      );

      const product = productCheck.rows[0];

      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, product.id, quantity, product.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, product.id]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Get orders for one user
router.get('/user/:userId', async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.userId]
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `
        SELECT 
          oi.id,
          oi.quantity,
          oi.price_at_purchase,
          p.name,
          p.category,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        `,
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows
      });
    }

    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin get all orders
router.get('/admin/all', async (req, res) => {
  try {
    const { user_role } = req.query;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view all orders' });
    }

    const ordersResult = await pool.query(
      `
      SELECT 
        orders.*,
        users.full_name,
        users.email
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
      `
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `
        SELECT 
          oi.id,
          oi.quantity,
          oi.price_at_purchase,
          p.name,
          p.category,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        `,
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows
      });
    }

    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { user_role, status, admin_note } = req.body;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update order status' });
    }

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1,
          admin_note = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [status, admin_note || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin delete order
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_role } = req.body;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete orders' });
    }

    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1',
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    await client.query('DELETE FROM orders WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Dashboard stats
router.get('/admin/stats/summary', async (req, res) => {
  try {
    const { user_role } = req.query;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view dashboard stats' });
    }

    const totalOrders = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
    const totalProducts = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    const totalUsers = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'user'");
    const pendingOrders = await pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'");
    const shippedOrders = await pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'shipped'");
    const deliveredOrders = await pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'delivered'");
    const revenue = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0)::numeric(10,2) AS total FROM orders WHERE status != 'cancelled'"
    );

    res.json({
      totalOrders: totalOrders.rows[0].count,
      totalProducts: totalProducts.rows[0].count,
      totalUsers: totalUsers.rows[0].count,
      pendingOrders: pendingOrders.rows[0].count,
      shippedOrders: shippedOrders.rows[0].count,
      deliveredOrders: deliveredOrders.rows[0].count,
      totalRevenue: revenue.rows[0].total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;