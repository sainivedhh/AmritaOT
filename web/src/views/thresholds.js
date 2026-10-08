import { getThresholdVersions } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderThresholdsContent(versions) {
  const rows = versions.map(v => {
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [v.version])]),
      h('td', {}, [v.proposed_by]),
      h('td', {}, [v.approved_by || 'Pending Auditor Approval']),
      h('td', {}, [h('span', { className: `badge status-${v.status === 'APPROVED' ? 'running' : 'warning'}` }, [v.status])]),
      h('td', {}, [v.changes]),
      h('td', {}, [
        v.status === 'APPROVED' 
          ? h('button', { className: 'primary-btn', style: 'padding: 0.2rem 0.5rem; font-size: 0.8rem;', onClick: () => alert(`Rolled back to ${v.version}`) }, ['Rollback'])
          : h('button', { className: 'primary-btn', style: 'background: var(--success); padding: 0.2rem 0.5rem; font-size: 0.8rem;', onClick: () => alert(`Version ${v.version} Approved!`) }, ['Approve'])
      ])
    ]);
  });

  return h('div', {}, [
    h('h2', {}, ['Threshold Versioning & Maker-Checker Workflow']),
    h('div', { className: 'card' }, [
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['Version']),
            h('th', {}, ['Proposed By']),
            h('th', {}, ['Approved By']),
            h('th', {}, ['Status']),
            h('th', {}, ['Changes Diff']),
            h('th', {}, ['Action'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const versions = await getThresholdVersions();
  const content = renderThresholdsContent(versions);
  const shell = renderShell('/thresholds.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
