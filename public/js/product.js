function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} added to cart`);
}

async function loadProductDetails() {
  const productId = getProductIdFromUrl();
  const productView = document.getElementById('productView');

  if (!productId || !productView) {
    if (productView) {
      productView.innerHTML = '<p>Product not found.</p>';
    }
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();

    if (!res.ok) {
      productView.innerHTML = '<p>Could not load product details.</p>';
      return;
    }

    productView.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-md-5">
          <img 
            src="${product.image_url || '/images/placeholder.jpg'}" 
            alt="${product.name}" 
            class="img-fluid rounded shadow-sm w-100"
          >
        </div>

        <div class="col-md-7">
          <h1 class="fw-bold mb-3">${product.name}</h1>
          <p class="mb-2"><strong>Category:</strong> ${product.category}</p>
          <p class="mb-3">${product.description || 'No description available.'}</p>
          <h2 class="text-primary mb-3">€${product.price}</h2>
          <p class="small text-muted">Stock available: ${product.stock}</p>

          <button class="btn btn-primary" id="addToCartBtn">Add to cart</button>
        </div>
      </div>
    `;

    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => addToCart(product));
    }
  } catch (error) {
    console.error(error);
    productView.innerHTML = '<p>Could not load product details.</p>';
  }
}

loadProductDetails();