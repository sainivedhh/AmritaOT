import { getToken, logout } from '../shared/auth.js';
import { mockLogin, mockGetMachines, mockGetAlerts } from './mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiCall(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }
  if (res.status === 403) throw new Error('Forbidden');
  if (res.status === 429) throw new Error('Rate limit exceeded');
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

export async function login(username, password) {
  if (USE_MOCK) return mockLogin(username);
  return apiCall('/login', { method: 'POST', body: { username, password } });
}

export async function getMachinesStatus() {
  if (USE_MOCK) return mockGetMachines();
  return apiCall('/machines/status');
}

export async function getAlerts() {
  if (USE_MOCK) return mockGetAlerts();
  return apiCall('/alerts');
}
