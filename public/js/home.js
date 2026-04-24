async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!res.ok || !products.length) {
      container.innerHTML = '<p class="text-center">No featured products found.</p>';
      return;
    }

    const featured = products.slice(0, 3);

    container.innerHTML = featured.map(product => `
      <div class="col-md-6 col-lg-4">
        <article class="card product-card h-100 border-0 shadow-sm">
          <div class="product-image-wrap">
            <img
              src="${product.image_url || '/images/placeholder.jpg'}"
              alt="${product.name}"
              class="product-image"
              onerror="this.src='/images/placeholder.jpg'"
            >
          </div>
          <div class="card-body d-flex flex-column">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-meta">${product.category || 'Sports'}</p>
            <p class="product-description flex-grow-1">${product.description || 'Sports product for your needs.'}</p>
            <div class="product-actions mt-3">
              <strong class="text-primary fs-5">€${product.price}</strong>
              <a href="./product.html?id=${product.id}" class="btn btn-primary btn-sm">View details</a>
            </div>
          </div>
        </article>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-center">Could not load featured products.</p>';
  }
}

loadFeaturedProducts();