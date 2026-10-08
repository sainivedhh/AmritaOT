import { getAlerts } from '../api/client.js';
import { h } from '../shared/dom.js';
import { logout } from '../shared/auth.js';

document.getElementById('logout-btn').addEventListener('click', logout);

async function load() {
    try {
        const alerts = await getAlerts();
        const tbody = document.getElementById('alerts-tbody');
        tbody.innerHTML = ''; // clear
        
        alerts.forEach(a => {
            const tr = h('tr', {}, [
                h('td', {}, [a.machine_id]),
                h('td', {}, [a.metric]),
                h('td', {}, [String(a.value)]),
                h('td', {}, [
                    h('span', { className: `badge status-fault` }, [a.severity])
                ])
            ]);
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

load();
