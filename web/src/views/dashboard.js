import { getMachinesStatus } from '../api/client.js';
import { h } from '../shared/dom.js';
import { logout } from '../shared/auth.js';

document.getElementById('logout-btn').addEventListener('click', logout);

async function load() {
    try {
        const machines = await getMachinesStatus();
        const grid = document.getElementById('machines-grid');
        grid.innerHTML = ''; // clear
        
        machines.forEach(m => {
            const temp = m.last_reading ? `${m.last_reading.temperature}°C` : 'N/A';
            const statusClass = `badge status-${m.status.toLowerCase()}`;
            
            const card = h('div', { className: 'card' }, [
                h('div', { className: 'card-header' }, [
                    h('h3', {}, [m.name]),
                    h('span', { className: statusClass }, [m.status])
                ]),
                h('p', {}, [`Temp: ${temp}`])
            ]);
            
            grid.appendChild(card);
        });
    } catch (e) {
        console.error(e);
    }
}

load();
setInterval(load, 5000);
