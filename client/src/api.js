async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { code: data.code, status: res.status });
  return data;
}

export const api = {
  visit: (count) => request('/visits', { method: count ? 'POST' : 'GET' }),
  festivals: () => request('/festivals'),
  me: () => request('/auth/me'),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  publicContent: () => request('/content'),
  publicFestivals: () => request('/cms/festivals'),
  adminOverview: () => request('/admin/overview'),
  adminContent: () => request('/admin/content'),
  saveContent: (key, body) => request(`/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(body) }),
  resetContent: (key) => request(`/admin/content/${encodeURIComponent(key)}`, { method: 'DELETE' }),
  adminFestivals: () => request('/admin/festivals'),
  initializeFestivals: (festivals) => request('/admin/festivals/initialize', { method: 'POST', body: JSON.stringify({ festivals }) }),
  createFestival: (body) => request('/admin/festivals', { method: 'POST', body: JSON.stringify(body) }),
  updateFestival: (id, body) => request(`/admin/festivals/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFestival: (id) => request(`/admin/festivals/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  reorderFestivals: (ids) => request('/admin/festivals-order', { method: 'PUT', body: JSON.stringify({ ids }) }),
  adminMedia: () => request('/admin/media'),
  uploadMedia: (body) => request('/admin/media', { method: 'POST', body: JSON.stringify(body) }),
  updateMedia: (id, caption) => request(`/admin/media/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ caption }) }),
  replaceMedia: (id, body) => request(`/admin/media/${encodeURIComponent(id)}/replace`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMedia: (id) => request(`/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
