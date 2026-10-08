let token = null;
let role = null;
let pollInterval = null;

const $ = id => document.getElementById(id);

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch (e) { return null; }
}

function nav(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    $(`${screenId}-screen`).classList.add('active');
    
    if (pollInterval) clearInterval(pollInterval);
    
    if (screenId === 'dashboard') {
        loadDashboard();
        pollInterval = setInterval(loadDashboard, 5000);
    } else if (screenId === 'alerts') {
        loadAlerts();
    }
}

async function apiCall(endpoint, options = {}) {
    if (token) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(endpoint, options);
    if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
    }
    if (res.status === 403) throw new Error("Forbidden");
    if (res.status === 429) throw new Error("Rate limit exceeded");
    return res;
}

$('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = $('username').value;
    const p = $('password').value;
    $('login-error').textContent = '';
    
    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: u, password: p})
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            const parsed = parseJwt(token);
            role = parsed.role;
            
            $('login-form').reset();
            $('nav-links').style.display = 'block';
            
            if (role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
            }
            nav('dashboard');
        } else {
            $('login-error').textContent = data.error || 'Login failed';
        }
    } catch(err) {
        $('login-error').textContent = 'Network error';
    }
});

function logout() {
    token = null;
    role = null;
    if (pollInterval) clearInterval(pollInterval);
    $('nav-links').style.display = 'none';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    nav('login');
}

async function loadDashboard() {
    try {
        const res = await apiCall('/machines/status');
        const data = await res.json();
        const container = $('machines-container');
        container.innerHTML = '';
        
        data.forEach(m => {
            const isStale = m.last_reading && (Date.now()/1000 - m.last_reading.ts > 30);
            
            const card = document.createElement('div');
            card.className = 'card';
            
            const title = document.createElement('h3');
            title.textContent = `${m.name} (${m.id}) `;
            
            const badge = document.createElement('span');
            badge.className = `status-badge ${m.status}`;
            badge.textContent = m.status;
            title.appendChild(badge);
            
            if (isStale) {
                const stale = document.createElement('span');
                stale.className = 'stale';
                stale.textContent = ' (STALE DATA)';
                title.appendChild(stale);
            }
            card.appendChild(title);
            
            if (m.last_reading) {
                const p = document.createElement('p');
                p.textContent = `Temp: ${m.last_reading.temperature}°C | Press: ${m.last_reading.pressure} PSI | Vib: ${m.last_reading.vibration} mm/s | Pwr: ${m.last_reading.power} kW`;
                card.appendChild(p);
            } else {
                const p = document.createElement('p');
                p.textContent = "No readings yet.";
                card.appendChild(p);
            }
            
            container.appendChild(card);
        });
    } catch(e) { }
}

async function confirmThreshold() {
    const m = $('thresh-machine').value;
    const metric = $('thresh-metric').value;
    const min = parseFloat($('thresh-min').value);
    const max = parseFloat($('thresh-max').value);
    
    if (confirm(`Change ${metric} on ${m} to ${min} - ${max}?`)) {
        try {
            const res = await apiCall('/thresholds', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({machine_id: m, metric, min_val: min, max_val: max})
            });
            const data = await res.json();
            if (res.ok) {
                $('thresh-msg').className = 'success';
                $('thresh-msg').textContent = 'Updated successfully';
            } else {
                $('thresh-msg').className = 'error';
                $('thresh-msg').textContent = data.error;
            }
        } catch(e) {
            $('thresh-msg').className = 'error';
            $('thresh-msg').textContent = e.message;
        }
    }
}

async function loadAlerts() {
    try {
        const res = await apiCall('/alerts');
        const alerts = await res.json();
        const tbody = $('alerts-tbody');
        tbody.innerHTML = '';
        
        alerts.forEach(a => {
            if (a.state === 'OPEN') {
                const tr = document.createElement('tr');
                
                const tdM = document.createElement('td'); tdM.textContent = a.machine_id;
                const tdMet = document.createElement('td'); tdMet.textContent = a.metric;
                const tdV = document.createElement('td'); tdV.textContent = a.value;
                const tdS = document.createElement('td'); tdS.textContent = a.severity;
                
                const tdA = document.createElement('td');
                const btn = document.createElement('button');
                btn.textContent = 'Acknowledge';
                btn.onclick = () => ackAlert(a.id);
                if(role === 'auditor') btn.disabled = true; // auditors can't ack
                tdA.appendChild(btn);
                
                tr.appendChild(tdM); tr.appendChild(tdMet); tr.appendChild(tdV); tr.appendChild(tdS); tr.appendChild(tdA);
                tbody.appendChild(tr);
            }
        });
    } catch(e) {}
}

async function ackAlert(id) {
    try {
        const res = await apiCall(`/alerts/${id}/acknowledge`, {method: 'POST'});
        if (res.ok) loadAlerts();
        else alert("Failed to acknowledge");
    } catch(e) { alert(e.message); }
}

$('maint-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('maint-machine').value;
    const d = parseFloat($('maint-date').value);
    const desc = $('maint-desc').value;
    
    try {
        const res = await apiCall('/maintenance', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({machine_id: m, scheduled_for: d, description: desc})
        });
        const data = await res.json();
        if (res.ok) {
            $('maint-msg').className = 'success';
            $('maint-msg').textContent = 'Scheduled';
            $('maint-form').reset();
        } else {
            $('maint-msg').className = 'error';
            $('maint-msg').textContent = data.error;
        }
    } catch(e) {
        $('maint-msg').className = 'error';
        $('maint-msg').textContent = e.message;
    }
});
