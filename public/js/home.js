// async function loadFeaturedProducts() {
//   const container = document.getElementById('featuredProducts');
//   if (!container) return;

//   try {
//     const res = await fetch('/api/products/featured');
//     const data = await res.json();

//     if (!res.ok) {
//       container.innerHTML = '<p>Could not load products.</p>';
//       return;
//     }

//     if (!data.length) {
//       container.innerHTML = '<p>No featured products found.</p>';
//       return;
//     }

//     container.innerHTML = data.map(product => `
//       <div class="col-md-4">
//         <div class="card h-100 shadow-sm border-0">
//           <img
//             src="${product.image_url || '/images/placeholder.jpg'}"
//             alt="${product.name}"
//             class="product-image"
//           >
//           <div class="card-body">
//             <h3 class="product-title">${product.name}</h3>
//             <p class="product-meta">${product.category}</p>
//             <p>${product.description || 'No description available.'}</p>
//             <div class="product-actions">
//               <strong>€${product.price}</strong>
//               <a href="/product.html?id=${product.id}" class="btn btn-primary btn-sm">View details</a>
//             </div>
//           </div>
//         </div>
//       </div>
//     `).join('');
//   } catch (error) {
//     console.error(error);
//     container.innerHTML = '<p>Could not load products.</p>';
//   }
// }

// loadFeaturedProducts();







async function loadHomeProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = '<p class="text-center">Could not load products.</p>';
      return;
    }

    if (!data.length) {
      container.innerHTML = '<p class="text-center">No products found.</p>';
      return;
    }

    container.innerHTML = data.map(product => `
      <div class="col-md-6 col-lg-4">
        <div class="card product-card h-100 shadow-sm border-0">
          <img
            src="${product.image_url || '/images/placeholder.jpg'}"
            alt="${product.name}"
            class="product-image"
          >
          <div class="card-body d-flex flex-column">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-meta">${product.category || 'Sports item'}</p>
            <p class="flex-grow-1">${product.description || 'No description available.'}</p>
            <div class="product-actions mt-3">
              <strong class="text-primary fs-5">€${product.price}</strong>
              <a href="/product.html?id=${product.id}" class="btn btn-primary btn-sm">View details</a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-center">Could not load products.</p>';
  }
}

loadHomeProducts();