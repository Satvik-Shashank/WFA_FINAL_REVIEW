const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }
  return data;
}

// Sellers
export const sellersApi = {
  getAll: () => request('/sellers'),
  getById: (id) => request(`/sellers/${id}`),
  register: (data) => request('/sellers', { method: 'POST', body: JSON.stringify(data) }),
  decide: (id, decision) => request(`/sellers/${id}/decision`, { method: 'PATCH', body: JSON.stringify({ decision }) })
};

// Products
export const productsApi = {
  getAll: (sellerId) => request('/products' + (sellerId ? `?sellerId=${sellerId}` : '')),
  getApproved: () => request('/products/approved'),
  submit: (sellerId, data) => request(`/products/seller/${sellerId}`, { method: 'POST', body: JSON.stringify(data) }),
  decide: (id, decision, rejectionReason) => request(`/products/${id}/decision`, {
    method: 'PATCH',
    body: JSON.stringify({ decision, rejectionReason })
  })
};

// Tasks (Tasklist)
export const tasksApi = {
  getAll: () => request('/tasks'),
  getPending: () => request('/tasks/pending'),
  create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  complete: (id) => request(`/tasks/${id}/complete`, { method: 'POST' })
};

// Process
export const processApi = {
  start: (data) => request('/process/start', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: (key) => request(`/process/status/${key}`)
};

