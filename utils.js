// Utilities shared across pages

export const STORAGE_KEYS = {
  products: 'minishop_products',
  adminHash: 'minishop_admin_hash',
  adminSession: 'minishop_admin_session',
};

export function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
  } catch (e) {
    return `$${Number(amount).toFixed(2)}`;
  }
}

export function generateId() {
  const part = () => Math.random().toString(36).slice(2, 8);
  return `${part()}-${part()}`;
}

export function readLocalProducts() {
  const raw = localStorage.getItem(STORAGE_KEYS.products);
  if (!raw) return [];
  try { return JSON.parse(raw) ?? []; } catch { return []; }
}

export function writeLocalProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export async function getAllProducts() {
  let products = readLocalProducts();
  if (products.length > 0) return products;
  // Seed from products.json on first load
  try {
    const res = await fetch('/products.json', { cache: 'no-store' });
    if (res.ok) {
      products = await res.json();
      writeLocalProducts(products);
      return products;
    }
  } catch {}
  return products;
}

export async function sha256Hex(text) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_ADMIN_PASSWORD_PLAIN = 'admin123';

export async function ensureAdminPasswordSeeded() {
  const existing = localStorage.getItem(STORAGE_KEYS.adminHash);
  if (!existing) {
    const hash = await sha256Hex(DEFAULT_ADMIN_PASSWORD_PLAIN);
    localStorage.setItem(STORAGE_KEYS.adminHash, hash);
  }
}

export async function loginAdmin(plainPassword) {
  const storedHash = localStorage.getItem(STORAGE_KEYS.adminHash);
  const candidate = await sha256Hex(plainPassword);
  const ok = storedHash && storedHash === candidate;
  if (ok) sessionStorage.setItem(STORAGE_KEYS.adminSession, 'true');
  return ok;
}

export function logoutAdmin() {
  sessionStorage.removeItem(STORAGE_KEYS.adminSession);
}

export function isAdminAuthed() {
  return sessionStorage.getItem(STORAGE_KEYS.adminSession) === 'true';
}

export async function updateAdminPassword(newPlain) {
  const hash = await sha256Hex(newPlain);
  localStorage.setItem(STORAGE_KEYS.adminHash, hash);
}

export function setYearFooter() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}
