const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="alert alert-info">Your cart is empty.</div>';
    cartTotalElement.textContent = '0.00';
    return;
  }

  let total = 0;

  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    return `
      <div class="card mb-3 shadow-sm border-0">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${item.name}</h5>
            <p class="mb-1 text-muted">Price: €${item.price}</p>
            <p class="mb-0">Quantity: ${item.quantity}</p>
          </div>
          <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotalElement.textContent = total.toFixed(2);
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

loadCart();