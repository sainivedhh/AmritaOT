import { getWorkOrders } from '../api/client.js';
import { h, renderTable } from '../shared/dom.js';
import { mountPage } from '../shared/layout.js';

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
      renderTable(["Work Order ID","Machine","Priority","Assignee","Status","SLA Due","Required Parts"], rows)
    ])
  ]);
}

async function init() {
  const orders = await getWorkOrders();
  const content = renderMaintenanceContent(orders);
  mountPage('/maintenance.html', content);
}

init();
