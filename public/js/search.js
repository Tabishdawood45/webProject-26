function searchProducts() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  const query = input.value.trim().toLowerCase();

  if (!query) {
    window.renderProducts(window.allProducts);
    return;
  }

  const filteredProducts = window.allProducts.filter(product => {
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const rating = String(product.rating || '').toLowerCase();

    return (
      name.includes(query) ||
      category.includes(query) ||
      rating.includes(query)
    );
  });

  window.renderProducts(filteredProducts);
}

document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  if (searchBtn) {
    searchBtn.addEventListener('click', searchProducts);
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        searchProducts();
      }
    });

    searchInput.addEventListener('input', function () {
      if (searchInput.value.trim() === '') {
        window.renderProducts(window.allProducts);
      }
    });
  }
});