import { getReports } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderReportsContent(reports) {
  const rows = reports.map(r => {
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [r.id])]),
      h('td', {}, [r.title]),
      h('td', {}, [r.format]),
      h('td', {}, [r.generated]),
      h('td', {}, [r.size]),
      h('td', {}, [h('button', { className: 'primary-btn', style: 'padding: 0.2rem 0.5rem; font-size: 0.8rem;', onClick: () => alert(`Downloading ${r.title}...`) }, ['Download'])])
    ]);
  });

  return h('div', {}, [
    h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;' }, [
      h('h2', { style: 'margin: 0;' }, ['Compliance & Operational Reports']),
      h('button', { className: 'primary-btn', onClick: () => alert("Generating IEC 62443 Compliance Pack...") }, ['+ Generate New Report'])
    ]),
    h('div', { className: 'card' }, [
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['ID']),
            h('th', {}, ['Title']),
            h('th', {}, ['Format']),
            h('th', {}, ['Generated Date']),
            h('th', {}, ['File Size']),
            h('th', {}, ['Action'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const reports = await getReports();
  const content = renderReportsContent(reports);
  const shell = renderShell('/reports.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
