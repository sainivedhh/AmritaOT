import { getWorkOrders } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderMaintenanceContent(orders) {
  const rows = orders.map(o => {
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [o.id])]),
      h('td', {}, [o.machine_id]),
      h('td', {}, [h('span', { className: `badge status-${o.priority.toLowerCase() === 'high' ? 'fault' : 'warning'}` }, [o.priority])]),
      h('td', {}, [o.assignee]),
      h('td', {}, [o.status]),
      h('td', {}, [o.sla_due]),
      h('td', {}, [o.parts.join(', ')])
    ]);
  });

  return h('div', {}, [
    h('h2', {}, ['Maintenance Work Orders & Inventory']),
    h('div', { className: 'card' }, [
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['Work Order ID']),
            h('th', {}, ['Machine']),
            h('th', {}, ['Priority']),
            h('th', {}, ['Assignee']),
            h('th', {}, ['Status']),
            h('th', {}, ['SLA Due']),
            h('th', {}, ['Required Parts'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const orders = await getWorkOrders();
  const content = renderMaintenanceContent(orders);
  const shell = renderShell('/maintenance.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
