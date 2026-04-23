const user = JSON.parse(localStorage.getItem('user'));

const ordersList = document.getElementById('ordersList');
const adminSection = document.getElementById('adminSection');
const adminStats = document.getElementById('adminStats');
const adminOrdersList = document.getElementById('adminOrdersList');
const productAdminList = document.getElementById('productAdminList');
const productForm = document.getElementById('productForm');
const productAlert = document.getElementById('productAlert');

if (!user) {
  alert('Please login first');
  window.location.href = '/login.html';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function formatDeliveryDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function showAlert(message, type = 'success') {
  productAlert.className = `alert alert-${type}`;
  productAlert.textContent = message;
}

async function loadUserOrders() {
  try {
    const res = await fetch(`/api/orders/user/${user.id}`);
    const orders = await res.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      ordersList.innerHTML = `<div class="alert alert-info">No orders found yet.</div>`;
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="form-card" style="margin-bottom: 18px;">
        <div class="space-between" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin:0;">${order.order_number}</h3>
            <p class="small" style="margin: 6px 0 0;">Placed on ${formatDate(order.created_at)}</p>
          </div>
          <div>
            <span class="product-category-badge">${order.status}</span>
          </div>
        </div>

        <p><strong>Total:</strong> €${Number(order.total_amount).toFixed(2)}</p>
        <p><strong>Estimated Delivery:</strong> ${order.estimated_delivery ? formatDeliveryDate(order.estimated_delivery) : 'Not available'}</p>
        <p><strong>Admin Note:</strong> ${order.admin_note || 'No update yet'}</p>

        <div class="reviews-list">
          ${order.items.map(item => `
            <div class="review-card">
              <div class="card-body">
                <h4 style="margin:0 0 8px;">${item.name}</h4>
                <p class="small">Category: ${item.category}</p>
                <p class="small">Quantity: ${item.quantity}</p>
                <p class="small">Price at purchase: €${Number(item.price_at_purchase).toFixed(2)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    ordersList.innerHTML = `<div class="alert alert-danger">Failed to load orders.</div>`;
  }
}

async function loadAdminStats() {
  if (user.role !== 'admin') return;

  try {
    const res = await fetch(`/api/orders/admin/stats/summary?user_role=${user.role}`);
    const data = await res.json();

    adminStats.innerHTML = `
      <div class="form-card"><h3>${data.totalOrders}</h3><p>Total Orders</p></div>
      <div class="form-card"><h3>${data.totalProducts}</h3><p>Total Products</p></div>
      <div class="form-card"><h3>${data.totalUsers}</h3><p>Total Users</p></div>
      <div class="form-card"><h3>${data.pendingOrders}</h3><p>Pending Orders</p></div>
      <div class="form-card"><h3>${data.shippedOrders}</h3><p>Shipped Orders</p></div>
      <div class="form-card"><h3>${data.deliveredOrders}</h3><p>Delivered Orders</p></div>
      <div class="form-card"><h3>€${Number(data.totalRevenue).toFixed(2)}</h3><p>Total Revenue</p></div>
    `;
  } catch (error) {
    console.error(error);
  }
}

async function loadAdminOrders() {
  if (user.role !== 'admin') return;

  try {
    const res = await fetch(`/api/orders/admin/all?user_role=${user.role}`);
    const orders = await res.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      adminOrdersList.innerHTML = `<div class="alert alert-info">No orders available.</div>`;
      return;
    }

    adminOrdersList.innerHTML = orders.map(order => `
      <div class="form-card" style="margin-bottom: 18px;">
        <div class="space-between" style="margin-bottom: 10px;">
          <div>
            <h3 style="margin:0;">${order.order_number}</h3>
            <p class="small">${order.full_name} (${order.email})</p>
          </div>
          <div>
            <span class="product-category-badge">${order.status}</span>
          </div>
        </div>

        <p><strong>Total:</strong> €${Number(order.total_amount).toFixed(2)}</p>
        <p><strong>Placed:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Estimated Delivery:</strong> ${order.estimated_delivery ? formatDeliveryDate(order.estimated_delivery) : 'Not set'}</p>

        <div style="margin: 14px 0;">
          <label><strong>Update Status</strong></label>
          <select id="status-${order.id}" class="form-control" style="margin-top: 8px;">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
          </select>
        </div>

        <div class="product-detail-actions">
          <button class="btn btn-primary" onclick="updateOrderStatus(${order.id})">Save Status</button>
          <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete Order</button>
        </div>

        <div style="margin-top: 14px;">
          ${order.items.map(item => `
            <div class="review-card" style="margin-top: 10px;">
              <div class="card-body">
                <strong>${item.name}</strong>
                <p class="small">Qty: ${item.quantity} | Price: €${Number(item.price_at_purchase).toFixed(2)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    adminOrdersList.innerHTML = `<div class="alert alert-danger">Failed to load admin orders.</div>`;
  }
}

async function updateOrderStatus(orderId) {
  const status = document.getElementById(`status-${orderId}`).value;

  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_role: user.role,
        status,
        admin_note: `Order status updated to ${status}`
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to update status');
      return;
    }

    alert('Order status updated');
    loadAdminOrders();
    loadUserOrders();
    loadAdminStats();
  } catch (error) {
    console.error(error);
    alert('Error updating order');
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;

  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: user.role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to delete order');
      return;
    }

    alert('Order deleted successfully');
    loadAdminOrders();
    loadAdminStats();
  } catch (error) {
    console.error(error);
    alert('Error deleting order');
  }
}

async function loadProductsForAdmin() {
  if (user.role !== 'admin') return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      productAdminList.innerHTML = `<div class="alert alert-info">No products available.</div>`;
      return;
    }

    productAdminList.innerHTML = products.map(product => `
      <div class="review-card" style="margin-bottom: 12px;">
        <div class="card-body">
          <div class="space-between">
            <div>
              <h4 style="margin:0 0 6px;">${product.name}</h4>
              <p class="small">Category: ${product.category}</p>
              <p class="small">Price: €${Number(product.price).toFixed(2)}</p>
              <p class="small">Stock: ${product.stock}</p>
            </div>
            <div class="product-detail-actions">
              <button class="btn btn-secondary" onclick='editProduct(${JSON.stringify(product)})'>Edit</button>
              <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

function editProduct(product) {
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productImage').value = product.image_url || '';
  document.getElementById('productDescription').value = product.description || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: user.role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to delete product');
      return;
    }

    alert('Product deleted successfully');
    loadProductsForAdmin();
    loadAdminStats();
  } catch (error) {
    console.error(error);
    alert('Error deleting product');
  }
}

if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const payload = {
      user_role: user.role,
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      price: document.getElementById('productPrice').value,
      stock: document.getElementById('productStock').value,
      image_url: document.getElementById('productImage').value,
      description: document.getElementById('productDescription').value
    };

    try {
      const res = await fetch(
        productId ? `/api/products/${productId}` : '/api/products',
        {
          method: productId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.message || 'Failed to save product', 'danger');
        return;
      }

      showAlert(productId ? 'Product updated successfully' : 'Product created successfully', 'success');
      productForm.reset();
      document.getElementById('productId').value = '';
      loadProductsForAdmin();
      loadAdminStats();
    } catch (error) {
      console.error(error);
      showAlert('Something went wrong', 'danger');
    }
  });
}

function showAdminSection() {
  if (user.role === 'admin') {
    adminSection.classList.remove('hidden');
  }
}

showAdminSection();
loadUserOrders();
loadAdminStats();
loadAdminOrders();
loadProductsForAdmin();

window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;