







// async function loadAllProducts() {
//   const container = document.getElementById('productsList');
//   if (!container) return;

//   try {
//     const res = await fetch('/api/products');
//     const data = await res.json();

//     if (!res.ok) {
//       container.innerHTML = '<p>Could not load products.</p>';
//       return;
//     }

//     if (!data.length) {
//       container.innerHTML = '<p>No products found.</p>';
//       return;
//     }

//     container.innerHTML = data.map(product => `
//       <article class="card product-card">
//         <img
//           src="${product.image_url || '/images/placeholder.jpg'}"
//           alt="${product.name}"
//           class="product-image"
//         >
//         <div class="card-body">
//           <h3 class="product-title">${product.name}</h3>
//           <p class="product-meta">${product.category}</p>
//           <p>${product.description || 'No description available.'}</p>
//           <div class="product-actions">
//             <strong>€${product.price}</strong>
//             <a href="/product.html?id=${product.id}" class="btn btn-primary">View details</a>
//           </div>
//         </div>
//       </article>
//     `).join('');
//   } catch (error) {
//     console.error(error);
//     container.innerHTML = '<p>Could not load products.</p>';
//   }
// }

// loadAllProducts();





// async function loadAllProducts() {
//   const container = document.getElementById('productsList');
//   if (!container) return;

//   try {
//     const res = await fetch('/api/products');
//     const data = await res.json();

//     if (!res.ok) {
//       container.innerHTML = '<p class="text-center">Could not load products.</p>';
//       return;
//     }

//     if (!data.length) {
//       container.innerHTML = '<p class="text-center">No products found.</p>';
//       return;
//     }

//     container.innerHTML = data.map(product => `
//       <div class="col-md-6 col-lg-4">
//         <article class="card product-card h-100 shadow-sm border-0">
//           <img
//             src="${product.image_url || '/images/placeholder.jpg'}"
//             alt="${product.name}"
//             class="product-image"
//           >
//           <div class="card-body d-flex flex-column">
//             <h3 class="product-title">${product.name}</h3>
//             <p class="product-meta">${product.category || 'Sports item'}</p>
//             <p class="flex-grow-1">${product.description || 'No description available.'}</p>
//             <div class="product-actions mt-3">
//               <strong class="text-primary fs-5">€${product.price}</strong>
//               <a href="/product.html?id=${product.id}" class="btn btn-primary">View details</a>
//             </div>
//           </div>
//         </article>
//       </div>
//     `).join('');
//   } catch (error) {
//     console.error(error);
//     container.innerHTML = '<p class="text-center">Could not load products.</p>';
//   }
// }

// loadAllProducts();


window.allProducts = [];

window.renderProducts = function(products) {
  const container = document.getElementById('productsList');
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<p class="text-center">No products found.</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="col-md-6 col-lg-4">
      <article class="card product-card h-100 shadow-sm border-0">
        <img
          src="${product.image_url || '/images/placeholder.jpg'}"
          alt="${product.name}"
          class="product-image"
        >
        <div class="card-body d-flex flex-column">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-meta">${product.category || 'Sports item'}</p>
          <p class="flex-grow-1">${product.description || 'No description available.'}</p>
          
          <div class="product-actions mt-3 d-flex justify-content-between align-items-center">
            <strong class="text-primary fs-5">€${product.price}</strong>
            <a href="/product.html?id=${product.id}" class="btn btn-primary">View details</a>
          </div>
        </div>
      </article>
    </div>
  `).join('');
};

async function loadAllProducts() {
  const container = document.getElementById('productsList');
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

    window.allProducts = data;
    window.renderProducts(window.allProducts);

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-center">Could not load products.</p>';
  }
}

loadAllProducts();