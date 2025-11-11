import { STORAGE_KEYS, ensureAdminPasswordSeeded, loginAdmin, logoutAdmin, isAdminAuthed, readLocalProducts, writeLocalProducts, getAllProducts, updateAdminPassword, formatCurrency, setYearFooter, generateId } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  setYearFooter();
  await ensureAdminPasswordSeeded();

  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  const productForm = document.getElementById('productForm');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const productsTable = document.getElementById('productsTable').querySelector('tbody');
  const adminSearch = document.getElementById('adminSearch');

  const passwordForm = document.getElementById('passwordForm');

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    refreshProductsTable();
  }

  function showLogin() {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  }

  if (isAdminAuthed()) {
    showDashboard();
  } else {
    showLogin();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    const ok = await loginAdmin(pwd);
    if (!ok) {
      alert('Invalid password');
      return;
    }
    showDashboard();
  });

  logoutBtn.addEventListener('click', () => {
    logoutAdmin();
    showLogin();
  });

  function readForm() {
    return {
      id: document.getElementById('productId').value || generateId(),
      title: document.getElementById('title').value.trim(),
      price: Number(document.getElementById('price').value),
      category: document.getElementById('category').value.trim(),
      image: document.getElementById('image').value.trim(),
      description: document.getElementById('description').value.trim(),
    };
  }

  function writeForm(p) {
    document.getElementById('productId').value = p?.id || '';
    document.getElementById('title').value = p?.title || '';
    document.getElementById('price').value = p?.price != null ? String(p.price) : '';
    document.getElementById('category').value = p?.category || '';
    document.getElementById('image').value = p?.image || '';
    document.getElementById('description').value = p?.description || '';
  }

  resetFormBtn.addEventListener('click', () => writeForm(null));

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readForm();
    if (!data.title || !data.category || !data.image || !data.description || !(data.price >= 0)) {
      alert('Please fill in all fields with valid values.');
      return;
    }
    const existing = readLocalProducts();
    const idx = existing.findIndex(p => p.id === data.id);
    if (idx >= 0) {
      existing[idx] = data;
    } else {
      existing.push(data);
    }
    writeLocalProducts(existing);
    writeForm(null);
    refreshProductsTable();
  });

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPwd = document.getElementById('newPassword').value;
    if (!newPwd || newPwd.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    await updateAdminPassword(newPwd);
    document.getElementById('newPassword').value = '';
    alert('Password updated for this browser.');
  });

  let fullList = await getAllProducts();
  let viewList = fullList.slice();

  function renderTable(list) {
    productsTable.innerHTML = '';
    for (const p of list) {
      const tr = document.createElement('tr');
      const tdTitle = document.createElement('td'); tdTitle.textContent = p.title;
      const tdCat = document.createElement('td'); tdCat.textContent = p.category;
      const tdPrice = document.createElement('td'); tdPrice.className = 'numeric'; tdPrice.textContent = formatCurrency(p.price);
      const tdActions = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.className = 'button'; editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        writeForm(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'button'; delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        if (!confirm('Delete this product?')) return;
        const existing = readLocalProducts().filter(x => x.id !== p.id);
        writeLocalProducts(existing);
        refreshProductsTable();
      });

      const viewBtn = document.createElement('a');
      viewBtn.className = 'button button-primary'; viewBtn.textContent = 'View';
      viewBtn.href = `/product.html?id=${encodeURIComponent(p.id)}`;
      viewBtn.target = '_blank';

      tdActions.append(editBtn, delBtn, viewBtn);
      tr.append(tdTitle, tdCat, tdPrice, tdActions);
      productsTable.appendChild(tr);
    }
  }

  function applyAdminFilter() {
    const q = (adminSearch.value || '').toLowerCase().trim();
    viewList = fullList.filter(p => !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    renderTable(viewList);
  }

  adminSearch.addEventListener('input', applyAdminFilter);

  async function refreshProductsTable() {
    fullList = readLocalProducts();
    if (fullList.length === 0) {
      // fallback to initial if local cleared somehow
      fullList = await getAllProducts();
    }
    applyAdminFilter();
  }
});
