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
    if (response.status === 401 && path !== '/api/auth/login' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  publicOverview: () => request('/api/public/overview'),
  publicHospitals: () => request('/api/public/hospitals'),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  stats: () => request('/api/dashboard/stats'),
  analytics: () => request('/api/dashboard/analytics'),
  notifications: () => request('/api/notifications'),
  unseenNotificationCount: () => request('/api/notifications/unseen-count'),
  markNotificationSeen: (id) => request(`/api/notifications/${id}/seen`, { method: 'PUT' }),
  markAllNotificationsSeen: () => request('/api/notifications/seen', { method: 'PUT' }),
  registerDonor: (body) => request('/api/donors', { method: 'POST', body: JSON.stringify(body) }),
  addDonor: (body) => request('/api/donors/admin', { method: 'POST', body: JSON.stringify(body) }),
  searchDonors: (q = '') => request(`/api/donors/search?q=${encodeURIComponent(q)}`),
  activeDonors: (q = '') => request(`/api/donors/active?q=${encodeURIComponent(q)}`),
  inactiveDonors: () => request('/api/donors/inactive'),
  activateDonor: (id) => request(`/api/donors/${id}/activate`, { method: 'PUT' }),
  toggleDonorAvailability: (id, available) =>
    request(`/api/donors/${id}/availability`, { method: 'PUT', body: JSON.stringify({ available }) }),
  deleteDonor: (id) => request(`/api/donors/${id}`, { method: 'DELETE' }),
  createRequest: (body) => request('/api/requests', { method: 'POST', body: JSON.stringify(body) }),
  listRequests: () => request('/api/requests'),
  getRequest: (id) => request(`/api/requests/${id}`),
  updateRequestStatus: (id, status) =>
    request(`/api/requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteRequest: (id) => request(`/api/requests/${id}`, { method: 'DELETE' }),
  sendMessage: (body) => request('/api/inbox', { method: 'POST', body: JSON.stringify(body) }),
  listInbox: () => request('/api/inbox'),
  deleteInbox: (id) => request(`/api/inbox/${id}`, { method: 'DELETE' }),
  listStock: () => request('/api/stock'),
  updateStock: (body) => request('/api/stock', { method: 'PUT', body: JSON.stringify(body) }),
  hospitals: () => request('/api/hospitals'),
  createHospital: (body) => request('/api/hospitals', { method: 'POST', body: JSON.stringify({ hospitalName: body.hospitalName, address: body.address, contactNumber: body.contactNumber }) }),
  updateHospital: (hospitalName, body) => request(`/api/hospitals/${encodeURIComponent(hospitalName)}`, { method: 'PUT', body: JSON.stringify({ hospitalName, address: body.address, contactNumber: body.contactNumber }) }),
  admins: () => request('/api/admins'),
  createAdmin: (body) => request('/api/admins', { method: 'POST', body: JSON.stringify(body) }),
  deleteAdmin: (id) => request(`/api/admins/${id}`, { method: 'DELETE' }),
  getProfile: () => request('/api/profile'),
  updateProfile: (body) => request('/api/profile', { method: 'PUT', body: JSON.stringify(body) }),
};
