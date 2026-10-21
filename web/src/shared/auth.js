export let token = null;
let role = null;

export function setToken(newToken, newRole) {
  token = newToken;
  if (typeof newRole === "string" && newRole.trim()) {
    const normalized = newRole.trim().toLowerCase();
    role = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  } else {
    role = null;
  }
}

export function getToken() {
  return token;
}

export function getRole() {
  return role;
}

export function logout() {
  token = null;
  role = null;
  window.location.href = "/index.html";
}
