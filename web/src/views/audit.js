import { getAuditLogs } from '../api/client.js';
import { verifyAuditChain } from '../shared/logic.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderAuditContent(logs) {
  const chainResult = verifyAuditChain(logs);

  const rows = logs.map(l => {
    return h('tr', {}, [
      h('td', {}, [l.id]),
      h('td', {}, [l.action]),
      h('td', {}, [l.user]),
      h('td', {}, [l.timestamp]),
      h('td', { style: 'font-family: monospace; font-size: 0.8rem;' }, [l.prev_hash]),
      h('td', { style: 'font-family: monospace; font-size: 0.8rem; color: var(--success);' }, [l.hash])
    ]);
  });

  return h('div', {}, [
    h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;' }, [
      h('h2', { style: 'margin: 0;' }, ['Tamper-Evident Audit Log Hash Chain']),
      h('button', {
        className: 'primary-btn',
        onClick: () => {
          if (chainResult.valid) {
            alert(`✅ AUDIT CHAIN INTEGRITY VERIFIED: ALL ${logs.length} RECORDS ARE VALID AND UNTAMPERED.`);
          } else {
            alert(`❌ AUDIT CHAIN INTEGRITY FAILED AT INDEX ${chainResult.brokenIndex}! TAMPERING DETECTED.`);
          }
        }
      }, ['🔍 Verify Audit Chain'])
    ]),

    h('div', { className: 'card' }, [
      h('div', { style: 'margin-bottom: 1rem; font-weight: bold; color: var(--success);' }, [
        chainResult.valid ? 'Chain Status: VALID (GENESIS -> LATEST)' : 'Chain Status: TAMPERED / INVALID'
      ]),
      h('table', { className: 'table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, ['ID']),
            h('th', {}, ['Action']),
            h('th', {}, ['User']),
            h('th', {}, ['Timestamp']),
            h('th', {}, ['Prev Hash']),
            h('th', {}, ['Current Hash'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

async function init() {
  const logs = await getAuditLogs();
  const content = renderAuditContent(logs);
  const shell = renderShell('/audit.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
