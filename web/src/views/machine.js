import { getMachinesStatus } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';
import { navigate } from '../shared/router.js';

let allMachines = [];
let anomalyFilter = 'ALL';

function renderMachineHealthContent(machines) {
  const filtered = anomalyFilter === 'ALL'
    ? machines
    : machines.filter(m => m.anomaly_badge === anomalyFilter);

  const tableRows = filtered.map(m => {
    const rulClass = m.rul_days < 14
      ? 'px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-semibold'
      : 'px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold';
    
    const anomalyClass = m.anomaly_badge === 'NORMAL'
      ? 'px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold'
      : (m.anomaly_badge === 'ANOMALY'
        ? 'px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold'
        : 'px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold');

    return h('tr', { className: 'border-b border-slate-100 hover:bg-slate-50 transition-colors' }, [
      h('td', { className: 'py-3 px-4 text-sm font-semibold text-slate-900' }, [m.id]),
      h('td', { className: 'py-3 px-4 text-sm text-slate-700' }, [m.name]),
      h('td', { className: 'py-3 px-4 text-sm text-slate-700 font-medium' }, [`${m.health_score} / 100`]),
      h('td', { className: 'py-3 px-4 text-sm' }, [h('span', { className: rulClass }, [`${m.rul_days} days`])]),
      h('td', { className: 'py-3 px-4 text-sm' }, [h('span', { className: anomalyClass }, [m.anomaly_badge])]),
      h('td', { className: 'py-3 px-4 text-sm text-slate-700 font-medium' }, [m.calibration_status]),
      h('td', { className: 'py-3 px-4 text-xs text-slate-500' }, [`MTBF: ${m.mtbf_hrs}h | MTTR: ${m.mttr_hrs}h`]),
      h('td', { className: 'py-3 px-4 text-sm' }, [
        h('div', { className: 'flex items-center gap-2' }, [
          h('button', {
            className: 'px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors',
            onClick: () => {
              m.calibration_status = 'VALID';
              renderApp();
              alert(`Node ${m.id} recalibrated successfully! Calibration status set to VALID.`);
            }
          }, ['Calibrate']),
          h('button', {
            className: 'px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors',
            onClick: () => navigate('/maintenance.html')
          }, ['Work Order'])
        ])
      ])
    ]);
  });

  const alertCards = machines.filter(m => m.rul_days < 14).map(m => {
    return h('div', { className: 'bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-4 flex flex-wrap justify-between items-center gap-4 shadow-sm' }, [
      h('div', {}, [
        h('h4', { className: 'text-red-800 font-bold text-sm m-0 flex items-center gap-2 font-headline-md' }, [
          h('span', { className: 'material-symbols-outlined text-base' }, ['warning']),
          h('span', {}, [`Predictive Maintenance Alert: ${m.name} (${m.id})`])
        ]),
        h('p', { className: 'text-red-700 text-xs m-0 mt-1' }, [
          `Estimated RUL is down to ${m.rul_days} days. High vibration and temperature signature detected.`
        ])
      ]),
      h('button', {
        className: 'px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm',
        onClick: () => navigate('/maintenance.html')
      }, ['Schedule Work Order'])
    ]);
  });

  const topControls = h('div', { className: 'flex flex-wrap justify-between items-center mb-6 gap-4' }, [
    h('div', {}, [
      h('h2', { className: 'text-2xl font-bold text-slate-900 font-headline-md tracking-tight m-0' }, ['Machine Health & Predictive Analytics']),
      h('p', { className: 'text-xs text-slate-500 m-0 mt-1' }, ['Surveillance of telemetry nodes, anomaly detection & calibration'])
    ]),
    h('div', { className: 'flex items-center gap-3' }, [
      h('select', {
        className: 'bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500',
        onChange: (e) => {
          anomalyFilter = e.target.value;
          renderApp();
        }
      }, [
        h('option', { value: 'ALL', selected: anomalyFilter === 'ALL' }, ['All Statuses']),
        h('option', { value: 'NORMAL', selected: anomalyFilter === 'NORMAL' }, ['Normal']),
        h('option', { value: 'WARNING', selected: anomalyFilter === 'WARNING' }, ['Warning']),
        h('option', { value: 'ANOMALY', selected: anomalyFilter === 'ANOMALY' }, ['Anomaly'])
      ]),
      h('button', {
        className: 'flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all',
        onClick: async () => {
          allMachines = await getMachinesStatus();
          renderApp();
          alert('Machine metrics and telemetry status updated!');
        }
      }, [
        h('span', { className: 'material-symbols-outlined text-sm' }, ['refresh']),
        h('span', {}, ['Refresh Metrics'])
      ])
    ])
  ]);

  return h('div', {}, [
    topControls,
    alertCards.length > 0 ? h('div', { className: 'mb-6' }, alertCards) : null,
    h('div', { className: 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden' }, [
      h('table', { className: 'w-full text-left border-collapse text-sm' }, [
        h('thead', { className: 'bg-slate-50 border-b border-slate-200' }, [
          h('tr', {}, [
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Machine ID']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Name']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Health Score']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['RUL Est.']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Anomaly Status']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Calibration']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Reliability Metrics']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Actions'])
          ])
        ]),
        h('tbody', {}, tableRows)
      ])
    ])
  ]);
}

function renderApp() {
  const content = renderMachineHealthContent(allMachines);
  const shell = renderShell('/machine.html', content);
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  setupShellEvents();
}

async function init() {
  allMachines = await getMachinesStatus();
  renderApp();
}

init();
