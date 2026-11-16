const API_BASE = import.meta.env.VITE_API_URL ?? '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  stats: () => request('/api/dashboard/stats'),
  registerDonor: (body) => request('/api/donors', { method: 'POST', body: JSON.stringify(body) }),
  searchDonors: (q = '') => request(`/api/donors/search?q=${encodeURIComponent(q)}`),
  activeDonors: (q = '') => request(`/api/donors/active?q=${encodeURIComponent(q)}`),
  inactiveDonors: () => request('/api/donors/inactive'),
  activateDonor: (id) => request(`/api/donors/${id}/activate`, { method: 'PUT' }),
  deleteDonor: (id) => request(`/api/donors/${id}`, { method: 'DELETE' }),
  createRequest: (body) => request('/api/requests', { method: 'POST', body: JSON.stringify(body) }),
  listRequests: () => request('/api/requests'),
  deleteRequest: (id) => request(`/api/requests/${id}`, { method: 'DELETE' }),
  sendMessage: (body) => request('/api/inbox', { method: 'POST', body: JSON.stringify(body) }),
  listInbox: () => request('/api/inbox'),
  deleteInbox: (id) => request(`/api/inbox/${id}`, { method: 'DELETE' }),
  listStock: () => request('/api/stock'),
  updateStock: (body) => request('/api/stock', { method: 'PUT', body: JSON.stringify(body) }),
};
