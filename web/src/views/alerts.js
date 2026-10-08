import { getAlerts } from '../api/client.js';
import { getRole } from '../shared/auth.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderAlertsContent(alerts) {
  const role = getRole();

  const rows = alerts.map(a => {
    const isAuditor = role === 'Auditor';
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [a.machine_id])]),
      h('td', {}, [a.metric]),
      h('td', {}, [String(a.value)]),
      h('td', {}, [h('span', { className: `badge status-${a.severity.toLowerCase() === 'high' ? 'fault' : 'warning'}` }, [a.severity])]),
      h('td', {}, [a.state]),
      h('td', {}, [a.timestamp || 'Just now']),
      h('td', {}, [
        h('button', {
          className: 'primary-btn',
          style: 'padding: 0.2rem 0.5rem; font-size: 0.8rem;',
          disabled: isAuditor,
          onClick: () => alert(`Alert #${a.id} acknowledged successfully!`)
        }, [isAuditor ? 'Read Only' : 'Acknowledge'])
      ])
    ]);
  });

  return h('div', {}, [
    h('h2', {}, ['Active System Alerts & Incidents']),
    h('div', { className: 'card' }, [
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['Machine ID']),
            h('th', {}, ['Metric']),
            h('th', {}, ['Current Value']),
            h('th', {}, ['Severity']),
            h('th', {}, ['State']),
            h('th', {}, ['Timestamp']),
            h('th', {}, ['Action'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const alerts = await getAlerts();
  const content = renderAlertsContent(alerts);
  const shell = renderShell('/alerts.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
