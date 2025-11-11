import { getAllProducts, formatCurrency, setYearFooter } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  setYearFooter();
  const grid = document.getElementById('productsGrid');
  const template = document.getElementById('productCardTemplate');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  let products = await getAllProducts();
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  for (const cat of categories) {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    categorySelect.appendChild(opt);
  }

  function render(list) {
    grid.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No products found.';
      grid.appendChild(empty);
      return;
    }
    for (const p of list) {
      const node = template.content.cloneNode(true);
      const img = node.querySelector('.product-image');
      const title = node.querySelector('.product-title');
      const price = node.querySelector('.product-price');
      const link = node.querySelector('.product-details-link');
      img.src = p.image; img.alt = p.title;
      title.textContent = p.title;
      price.textContent = formatCurrency(p.price);
      link.href = `/product.html?id=${encodeURIComponent(p.id)}`;
      grid.appendChild(node);
    }
  }

  function applyFilters() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const cat = categorySelect.value;
    const filtered = products.filter(p => {
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchC = !cat || p.category === cat;
      return matchQ && matchC;
    });
    render(filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  categorySelect.addEventListener('change', applyFilters);

  render(products);
});
