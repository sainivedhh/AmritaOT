import { getIntegrations } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderIntegrationsContent(items) {
  const rows = items.map(i => {
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [i.name])]),
      h('td', {}, [i.type]),
      h('td', {}, [i.endpoint]),
      h('td', {}, [h('span', { className: `badge status-${i.status === 'Connected' ? 'running' : 'warning'}` }, [i.status])]),
      h('td', {}, [i.latency]),
      h('td', {}, [h('button', { className: 'primary-btn', style: 'padding: 0.2rem 0.5rem; font-size: 0.8rem;', onClick: () => alert(`Testing connection to ${i.name}... Success! Latency: ${i.latency}`) }, ['Test Connection'])])
    ]);
  });

  return h('div', {}, [
    h('h2', {}, ['Industrial Data Sources & Integrations']),
    h('div', { className: 'card' }, [
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['Integration Name']),
            h('th', {}, ['Protocol']),
            h('th', {}, ['Endpoint']),
            h('th', {}, ['Status']),
            h('th', {}, ['Latency']),
            h('th', {}, ['Action'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const items = await getIntegrations();
  const content = renderIntegrationsContent(items);
  const shell = renderShell('/integrations.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
