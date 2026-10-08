export let token = null;

export function setToken(newToken) {
  token = newToken;
}

export function getToken() {
  return token;
}

export function getRole() {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
}

export function logout() {
  token = null;
  window.location.href = '/index.html';
}
