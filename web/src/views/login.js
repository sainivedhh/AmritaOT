import { setToken } from '../shared/auth.js';
import * as api from '../api/client.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const mockBadge = document.getElementById('mock-badge');
if (mockBadge && USE_MOCK) {
    mockBadge.style.display = 'inline-flex';
}
const demoLogins = document.getElementById('demo-logins');
if (demoLogins) {
    demoLogins.style.display = 'block';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const errEl = document.getElementById('error-msg');
        const errContainer = document.getElementById('login-error-container');
        const submitBtn = document.getElementById('submit-btn');
        const btnLabel = document.getElementById('btn-label');
        
        if (errContainer) errContainer.classList.add('hidden');

        if (btnLabel && submitBtn) {
            btnLabel.textContent = 'VERIFYING BEARER INTEGRITY...';
            submitBtn.classList.add('opacity-80', 'cursor-wait');
        }
        
        try {
            const data = await api.login(u, p);
            setToken(data.token);
            
            if (btnLabel && submitBtn) {
                btnLabel.textContent = 'SESSION GRANTED • DISPATCHING TO CONSOLE...';
                submitBtn.classList.remove('bg-primary-container');
                submitBtn.classList.add('bg-[#0E7C86]', 'text-white');
            }
            
            setTimeout(() => {
                import('../shared/router.js').then(r => r.navigate('/dashboard.html'));
            }, 600);
        } catch (err) {
            if (btnLabel && submitBtn) {
                btnLabel.textContent = 'AUTHENTICATE & ENTER OT CONSOLE';
                submitBtn.classList.remove('opacity-80', 'cursor-wait', 'bg-[#0E7C86]', 'text-white');
                submitBtn.classList.add('bg-primary-container');
            }
            if (errEl) {
                errEl.textContent = err.message || 'Authentication failed';
            }
            if (errContainer) {
                errContainer.classList.remove('hidden');
            }
        }
    });
}
