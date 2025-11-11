import { getAllProducts, formatCurrency, setYearFooter } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  setYearFooter();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const root = document.getElementById('productDetail');
  const template = document.getElementById('productDetailTemplate');

  const products = await getAllProducts();
  const product = products.find(p => p.id === id);

  if (!product) {
    const notFound = document.createElement('div');
    notFound.className = 'card';
    notFound.textContent = 'Product not found.';
    root.appendChild(notFound);
    return;
  }

  const node = template.content.cloneNode(true);
  node.querySelector('.detail-image').src = product.image;
  node.querySelector('.detail-image').alt = product.title;
  node.querySelector('.detail-title').textContent = product.title;
  node.querySelector('.detail-price').textContent = formatCurrency(product.price);
  node.querySelector('.detail-category').textContent = product.category;
  node.querySelector('.detail-description').textContent = product.description;
  root.appendChild(node);
});
