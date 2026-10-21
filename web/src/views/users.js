import { h, renderTable } from '../shared/dom.js';
import { mountPage } from '../shared/layout.js';

function renderUsersContent() {
  const rbacMatrix = [
    { role: 'Admin', rules: 'Full', thresholds: 'Propose/Rollback', users: 'Full', audit: 'Read/Export' },
    { role: 'Engineer', rules: 'Create/Edit', thresholds: 'Propose', users: 'None', audit: 'Read' },
    { role: 'Auditor', rules: 'Read', thresholds: 'Approve', users: 'None', audit: 'Read/Export' }
  ];

  const rows = rbacMatrix.map(r => {
    return h('tr', {}, [
      h('td', {}, [h('strong', {}, [r.role])]),
      h('td', {}, [r.rules]),
      h('td', {}, [r.thresholds]),
      h('td', {}, [r.users]),
      h('td', {}, [r.audit])
    ]);
  });

  return h('div', {}, [
    h('h2', {}, ['Users, RBAC Matrix & Session Management']),
    h('div', { className: 'card' }, [
      h('h3', {}, ['Role-Based Access Control (RBAC) Matrix']),
      renderTable(["Role","Alert Rules","Thresholds","User Management","Audit Logs"], rows)
    ]),
    h('div', { className: 'card' }, [
      h('h3', {}, ['Active User Sessions']),
      renderTable(['User', 'IP Address', 'Device / Browser', 'Action'], [
          h('tr', {}, [
            h('td', {}, ['admin']),
            h('td', {}, ['192.168.1.50']),
            h('td', {}, ['Chrome 122 (Windows)']),
            h('td', {}, [h('button', { className: 'primary-btn', style: 'background: var(--danger); padding: 0.2rem 0.5rem;' }, ['Revoke'])])
          ])
        ])
    ])
  ]);
}

async function init() {
  const content = renderUsersContent();
  mountPage('/users.html', content);
}

init();
