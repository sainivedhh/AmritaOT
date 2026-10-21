import { getAuditLogs } from '../api/client.js';
import { h, renderTable } from '../shared/dom.js';
import { mountPage } from '../shared/layout.js';

function renderAuditContent(auditResult) {
  const logs = Array.isArray(auditResult?.logs) ? auditResult.logs : [];
  const chainResult = { valid: auditResult?.valid === true };

  const rows = logs.map(log => {
    const timestamp = Number.isFinite(Number(log.ts))
      ? new Date(Number(log.ts) * 1000).toLocaleString()
      : 'Unknown';

    return h('tr', {}, [
      h('td', {}, [log.id]),
      h('td', {}, [log.action]),
      h('td', {}, [log.actor]),
      h('td', {}, [timestamp]),
      h('td', { style: 'font-family: monospace; font-size: 0.8rem;' }, [log.prev_hash]),
      h('td', { style: 'font-family: monospace; font-size: 0.8rem; color: var(--success);' }, [log.hash])
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
            alert('❌ SERVER-SIDE AUDIT CHAIN VERIFICATION FAILED. TAMPERING MAY HAVE OCCURRED.');
          }
        }
      }, ['🔍 Verify Audit Chain'])
    ]),

    h('div', { className: 'card' }, [
      h('div', { style: 'margin-bottom: 1rem; font-weight: bold; color: var(--success);' }, [
        chainResult.valid ? 'Chain Status: VALID (GENESIS -> LATEST)' : 'Chain Status: TAMPERED / INVALID'
      ]),
      renderTable(['ID', 'Action', 'User', 'Timestamp', 'Prev Hash', 'Current Hash'], rows)
    ])
  ]);
}

async function init() {
  const auditResult = await getAuditLogs();
  const content = renderAuditContent(auditResult);
  mountPage('/audit.html', content);
}

init();
