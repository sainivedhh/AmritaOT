import { setToken } from '../shared/auth.js';
import * as api from '../api/client.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

if (USE_MOCK) {
    document.getElementById('mock-badge').style.display = 'inline-block';
    document.getElementById('demo-logins').classList.remove('hidden');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errEl = document.getElementById('error-msg');
    
    try {
        const data = await api.login(u, p);
        setToken(data.token);
        window.location.href = '/dashboard.html';
    } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
    }
});
