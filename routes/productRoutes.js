const express = require('express');
const router = express.Router();
const pool = require('../db');

// get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get featured products
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT 6'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// create product - admin only
router.post('/', async (req, res) => {
  try {
    const { user_role, name, category, price, stock, image_url, description } = req.body;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add products' });
    }

    const result = await pool.query(
      `
      INSERT INTO products (name, category, price, stock, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [name, category, price, stock, image_url, description]
    );

    res.json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// update product - admin only
router.put('/:id', async (req, res) => {
  try {
    const { user_role, name, category, price, stock, image_url, description } = req.body;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update products' });
    }

    const result = await pool.query(
      `
      UPDATE products
      SET name = $1,
          category = $2,
          price = $3,
          stock = $4,
          image_url = $5,
          description = $6
      WHERE id = $7
      RETURNING *
      `,
      [name, category, price, stock, image_url, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete product - admin only
router.delete('/:id', async (req, res) => {
  try {
    const { user_role } = req.body;

    if (user_role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete products' });
    }

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get product by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;