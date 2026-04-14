const API = '/api';

// ── Callback globale per gestire errori di protezione scrittura ──
let _onPasskeyRequired = null;
let _onAdminReadOnly = null;

export function setWriteProtectionHandlers({ onPasskeyRequired, onAdminReadOnly }) {
  _onPasskeyRequired = onPasskeyRequired;
  _onAdminReadOnly = onAdminReadOnly;
}

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${url}`, { ...options, headers });

  // Gestisci errori di protezione scrittura (dal WriteProtectionFilter)
  if (res.status === 403 && token) {
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      if (body.error === 'PASSKEY_REQUIRED') {
        if (_onPasskeyRequired) _onPasskeyRequired(body.message);
        throw new Error(body.message || 'Verifica con passkey richiesta');
      }
      if (body.error === 'ADMIN_READ_ONLY') {
        if (_onAdminReadOnly) _onAdminReadOnly(body.message);
        throw new Error(body.message || 'Non hai i permessi per questa operazione');
      }
    } catch (e) {
      if (e.message?.includes('passkey') || e.message?.includes('permessi')) throw e;
    }
    // 403 generico (token invalido/scaduto) → redirect login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
    throw new Error('Sessione scaduta, effettua di nuovo il login');
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
    throw new Error('Sessione scaduta, effettua di nuovo il login');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Errore ${res.status}`);
  }
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// Auth
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Restaurants
export const getRestaurants = () => request('/restaurants');
export const getRestaurant = (id) => request(`/restaurants/${id}`);
export const registerRestaurant = (data) => request('/restaurants/register', { method: 'POST', body: JSON.stringify(data) });
export const getRestaurantContacts = (id) => request(`/restaurants/${id}/contacts`);
export const updateRestaurantContacts = (id, data) => request(`/restaurants/${id}/contacts`, { method: 'PUT', body: JSON.stringify(data) });
export const getFeatureFlags = (id) => request(`/restaurants/${id}/features`);
export const updateFeatureFlags = (id, data) => request(`/restaurants/${id}/features`, { method: 'PUT', body: JSON.stringify(data) });

// Menu Items (Servizi)
export const getMenuItems = (restaurantId) => request(`/menu-items/restaurant/${restaurantId}`);
export const createMenuItem = (data) => request('/menu-items', { method: 'POST', body: JSON.stringify(data) });
export const toggleMenuItemAvailability = (id, available) => request(`/menu-items/${id}/availability?isAvailable=${available}`, { method: 'PATCH' });

// Menu Categories (Categorie Servizi)
export const getMenuCategories = (restaurantId) => request(`/menu-categories/restaurant/${restaurantId}`);
export const createMenuCategory = (restaurantId, data) => request(`/menu-categories/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateMenuCategory = (id, data) => request(`/menu-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMenuCategory = (id) => request(`/menu-categories/${id}`, { method: 'DELETE' });

// Menu Sections (Sezioni Servizi)
export const getMenuSections = (restaurantId) => request(`/menu-sections/restaurant/${restaurantId}`);
export const createMenuSection = (restaurantId, data) => request(`/menu-sections/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateMenuSection = (id, data) => request(`/menu-sections/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMenuSection = (id) => request(`/menu-sections/${id}`, { method: 'DELETE' });

// ── Prodotti ──
export const getProducts = (restaurantId) => request(`/products/restaurant/${restaurantId}`);
export const createProduct = (data) => request('/products', { method: 'POST', body: JSON.stringify(data) });
export const toggleProductAvailability = (id, available) => request(`/products/${id}/availability?isAvailable=${available}`, { method: 'PATCH' });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });

// ── Categorie Prodotti ──
export const getProductCategories = (restaurantId) => request(`/product-categories/restaurant/${restaurantId}`);
export const createProductCategory = (restaurantId, data) => request(`/product-categories/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateProductCategory = (id, data) => request(`/product-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProductCategory = (id) => request(`/product-categories/${id}`, { method: 'DELETE' });

// Admin Management
export const verifyOwnerPasskey = (passkey) => request('/auth/owner/verify-passkey', { method: 'POST', body: JSON.stringify({ passkey }) });
export const getVerificationStatus = () => request('/auth/owner/verification-status');
export const revokeVerification = () => request('/auth/owner/revoke-verification', { method: 'POST' });
export const getAdmins = () => request('/auth/admins');
export const createAdmin = (data) => request('/auth/admins', { method: 'POST', body: JSON.stringify(data) });
export const deleteAdmin = (id) => request(`/auth/admins/${id}`, { method: 'DELETE' });

// ── WebAuthn / FIDO2 Passkey ─────────────────────────────────

// Utility: Base64url ↔ ArrayBuffer
function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Controlla se il browser supporta WebAuthn
export function isWebAuthnSupported() {
  return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get
    && window.PublicKeyCredential);
}

// Controlla se l'utente ha passkey registrate
export const hasWebAuthnCredentials = () => request('/auth/webauthn/has-credentials');

// Lista passkey registrate
export const getWebAuthnCredentials = () => request('/auth/webauthn/credentials');

// Elimina una passkey
export const deleteWebAuthnCredential = (id) => request(`/auth/webauthn/credentials/${id}`, { method: 'DELETE' });

// Registrazione di una nuova Passkey
export async function registerPasskey(credentialName) {
  // 1. Ottenere le opzioni dal server
  const options = await request('/auth/webauthn/register/options', {
    method: 'POST',
    body: JSON.stringify({ credentialName: credentialName || 'Passkey' })
  });

  // 2. Convertire i campi base64url in ArrayBuffer per l'API del browser
  const publicKeyOptions = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToBuffer(options.user.id)
    },
    excludeCredentials: (options.excludeCredentials || []).map(c => ({
      ...c,
      id: base64urlToBuffer(c.id)
    }))
  };

  // 3. Creare la credenziale (il browser mostra il prompt biometrico)
  const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });

  // 4. Inviare il risultato al server
  const result = await request('/auth/webauthn/register/complete', {
    method: 'POST',
    body: JSON.stringify({
      credentialId: bufferToBase64url(credential.rawId),
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      attestationObject: bufferToBase64url(credential.response.attestationObject),
      credentialName: credentialName || 'Passkey'
    })
  });

  return result;
}

// Autenticazione con Passkey (per verifica owner)
export async function authenticateWithPasskey() {
  // 1. Ottenere le opzioni dal server
  const options = await request('/auth/webauthn/authenticate/options', { method: 'POST' });

  // 2. Convertire i campi base64url in ArrayBuffer
  const publicKeyOptions = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map(c => ({
      ...c,
      id: base64urlToBuffer(c.id)
    }))
  };

  // 3. Ottenere l'assertion (il browser mostra il prompt biometrico)
  const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });

  // 4. Inviare al server per verifica
  const result = await request('/auth/webauthn/authenticate/complete', {
    method: 'POST',
    body: JSON.stringify({
      credentialId: bufferToBase64url(assertion.rawId),
      clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
      authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
      signature: bufferToBase64url(assertion.response.signature)
    })
  });

  return result;
}

// Schedule (Opening Hours & Closing Days)
export const getOpeningHours = (restaurantId) => request(`/schedule/hours/${restaurantId}`);

// File Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/uploads', { method: 'POST', body: formData });
};
export const setOpeningHours = (restaurantId, data) => request(`/schedule/hours/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const getClosingDays = (restaurantId) => request(`/schedule/closing-days/${restaurantId}`);
export const addClosingDay = (restaurantId, data) => request(`/schedule/closing-days/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const removeClosingDay = (closingDayId) => request(`/schedule/closing-days/${closingDayId}`, { method: 'DELETE' });
export const checkAvailability = (restaurantId, date, time) => request(`/schedule/check/${restaurantId}?date=${date}&time=${time}`);

// About / Chi Siamo
export const getAboutContent = (restaurantId) => request(`/about/content/${restaurantId}`);
export const saveAboutContent = (restaurantId, data) => request(`/about/content/${restaurantId}`, { method: 'PUT', body: JSON.stringify(data) });
export const getAboutGallery = (restaurantId) => request(`/about/gallery/${restaurantId}`);
export const addAboutGalleryItem = (restaurantId, data) => request(`/about/gallery/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateAboutGalleryItem = (id, data) => request(`/about/gallery/item/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAboutGalleryItem = (id) => request(`/about/gallery/item/${id}`, { method: 'DELETE' });

// ── Promozioni ──
export const getPromotions = (restaurantId) => request(`/promotions/restaurant/${restaurantId}`);
export const getActivePromotions = (restaurantId) => request(`/promotions/active/${restaurantId}`);
export const createPromotion = (data) => request('/promotions', { method: 'POST', body: JSON.stringify(data) });
export const updatePromotion = (id, data) => request(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePromotion = (id) => request(`/promotions/${id}`, { method: 'DELETE' });
