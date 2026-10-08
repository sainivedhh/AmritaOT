import { getToken, logout } from '../shared/auth.js';
import * as mock from './mock.js';

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
  
  let data = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text };
    }
  }
  
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  return data;
}

export async function login(username, password, mfaCode) {
  if (USE_MOCK) return mock.mockLogin(username, password, mfaCode);
  return apiCall('/login', { method: 'POST', body: { username, password, mfaCode } });
}

export async function getMachinesStatus() {
  if (USE_MOCK) return mock.mockGetMachines();
  return apiCall('/machines/status');
}

export async function getAlerts() {
  if (USE_MOCK) return mock.mockGetAlerts();
  return apiCall('/alerts');
}

export async function getRules() {
  if (USE_MOCK) return mock.mockGetRules();
  return apiCall('/rules');
}

export async function saveRule(rule) {
  if (USE_MOCK) return mock.mockSaveRule(rule);
  return apiCall('/rules', { method: 'POST', body: rule });
}

export async function deleteRule(id) {
  if (USE_MOCK) return mock.mockDeleteRule(id);
  return apiCall(`/rules/${id}`, { method: 'DELETE' });
}

export async function getNotifications() {
  if (USE_MOCK) return mock.mockGetNotifications();
  return apiCall('/notifications');
}

export async function markNotificationRead(id) {
  if (USE_MOCK) return mock.mockMarkNotificationRead(id);
  return apiCall(`/notifications/${id}/read`, { method: 'POST' });
}

export async function getWorkOrders() {
  if (USE_MOCK) return mock.mockGetWorkOrders();
  return apiCall('/maintenance/workorders');
}

export async function getThresholdVersions() {
  if (USE_MOCK) return mock.mockGetThresholdVersions();
  return apiCall('/thresholds/versions');
}

export async function getAuditLogs() {
  if (USE_MOCK) return mock.mockGetAuditLogs();
  return apiCall('/audit/verify');
}

export async function getIntegrations() {
  if (USE_MOCK) return mock.mockGetIntegrations();
  return apiCall('/integrations');
}

export async function getReports() {
  if (USE_MOCK) return mock.mockGetReports();
  return apiCall('/reports');
}
