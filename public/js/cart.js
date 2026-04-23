const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartSubtotalElement = document.getElementById('cartSubtotal');
const checkoutBtn = document.querySelector('.checkout-btn');

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some sports products to see them here.</p>
        <a href="/products.html" class="btn btn-primary">Continue Shopping</a>
      </div>
    `;
    cartTotalElement.textContent = '0.00';
    cartSubtotalElement.textContent = '0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  let total = 0;

  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemTotal = price * quantity;
    total += itemTotal;

    return `
      <div class="cart-item-card">
        <div class="cart-item-left">
          <div class="cart-item-image-wrap">
            <img 
              src="${item.image_url || '/images/football.jpg'}" 
              alt="${item.name}" 
              class="cart-item-image"
            >
          </div>

          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <p class="cart-item-category">${item.category || 'Sports Item'}</p>

            <div class="cart-item-meta">
              <span class="cart-badge">Qty: ${quantity}</span>
              <span class="cart-price">€${price.toFixed(2)} each</span>
            </div>
          </div>
        </div>

        <div class="cart-item-right">
          <div class="cart-item-total">€${itemTotal.toFixed(2)}</div>
          <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotalElement.textContent = total.toFixed(2);
  cartSubtotalElement.textContent = total.toFixed(2);
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

async function placeOrder() {
  const user = getCurrentUser();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (!user) {
    alert('Please login first to place an order.');
    window.location.href = '/login.html';
    return;
  }

  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        cart,
        shipping_address: 'Customer default address'
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to place order');
      return;
    }

    localStorage.removeItem('cart');
    alert(`Order placed successfully! Order Number: ${data.order.order_number}`);
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error(error);
    alert('Something went wrong while placing the order');
  }
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', placeOrder);
}

loadCart();