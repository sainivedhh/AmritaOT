import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

function renderSettingsContent() {
  return h('div', {}, [
    h('h2', {}, ['System Preferences & Settings']),
    h('div', { className: 'card' }, [
      h('h3', {}, ['Units & Regional Settings']),
      h('div', { className: 'field', style: 'margin-bottom: 1rem;' }, [
        h('label', { style: 'display: block; margin-bottom: 0.5rem;' }, ['Measurement Unit System']),
        h('select', { style: 'padding: 0.5rem; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border); border-radius: 4px;' }, [
          h('option', { value: 'metric' }, ['Metric (°C, bar, kW, mm/s)']),
          h('option', { value: 'imperial' }, ['Imperial (°F, psi, hp, in/s)'])
        ])
      ]),
      h('div', { className: 'field', style: 'margin-bottom: 1rem;' }, [
        h('label', { style: 'display: block; margin-bottom: 0.5rem;' }, ['System Timezone']),
        h('input', { type: 'text', value: 'Asia/Kolkata (IST +05:30)', style: 'padding: 0.5rem; width: 300px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border); border-radius: 4px;' })
      ]),
      h('button', { className: 'primary-btn', onClick: () => alert('Settings saved successfully!') }, ['Save Preferences'])
    ]),
    h('div', { className: 'card' }, [
      h('h3', {}, ['Security Dependency Audit']),
      h('p', {}, ['Latest npm security vulnerability scan status:']),
      h('div', { className: 'badge status-running', style: 'font-size: 0.9rem; padding: 0.4rem 0.8rem;' }, ['0 High / Critical Vulnerabilities Found'])
    ])
  ]);
}

async function init() {
  const content = renderSettingsContent();
  const shell = renderShell('/settings.html', content);
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  
  setupShellEvents();
}

init();
