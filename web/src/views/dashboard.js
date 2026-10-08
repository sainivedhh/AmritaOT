import { getMachinesStatus } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';
import { navigate } from '../shared/router.js';

let allMachines = [];
let currentFilter = 'ALL';

function renderDashboardContent(machines) {
  const kpiRow = h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' }, [
    h('div', { className: 'card bg-white p-5 rounded-2xl border border-slate-200 shadow-sm' }, [
      h('div', { className: 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1' }, ['Overall OEE']),
      h('div', { className: 'text-2xl font-bold text-emerald-600 font-headline-md' }, ['88.4%'])
    ]),
    h('div', { className: 'card bg-white p-5 rounded-2xl border border-slate-200 shadow-sm' }, [
      h('div', { className: 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1' }, ['Availability']),
      h('div', { className: 'text-2xl font-bold text-slate-800 font-headline-md' }, ['94.2%'])
    ]),
    h('div', { className: 'card bg-white p-5 rounded-2xl border border-slate-200 shadow-sm' }, [
      h('div', { className: 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1' }, ['Performance']),
      h('div', { className: 'text-2xl font-bold text-slate-800 font-headline-md' }, ['91.0%'])
    ]),
    h('div', { className: 'card bg-white p-5 rounded-2xl border border-slate-200 shadow-sm' }, [
      h('div', { className: 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1' }, ['Quality Rate']),
      h('div', { className: 'text-2xl font-bold text-slate-800 font-headline-md' }, ['99.1%'])
    ])
  ]);

  const filteredMachines = currentFilter === 'ALL' 
    ? machines 
    : machines.filter(m => m.plant === currentFilter);

  const cards = filteredMachines.map(m => {
    const temp = m.last_reading ? `${m.last_reading.temperature} °C` : 'N/A';
    const statusLower = m.status.toLowerCase();
    const statusClass = statusLower === 'running'
      ? 'px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold'
      : (statusLower === 'fault'
        ? 'px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold'
        : 'px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold');

    return h('div', { className: 'card bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between' }, [
      h('div', {}, [
        h('div', { className: 'flex justify-between items-center mb-3' }, [
          h('h3', { className: 'm-0 text-base font-bold text-slate-900 font-headline-md' }, [m.name]),
          h('span', { className: statusClass }, [m.status])
        ]),
        h('div', { className: 'text-xs text-slate-500 mb-3' }, [`Plant: ${m.plant} • Area: ${m.area}`]),
        h('div', { className: 'space-y-1.5 text-sm text-slate-700 mb-4' }, [
          h('div', { className: 'flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, ['Temperature']),
            h('strong', { className: 'font-semibold text-slate-900' }, [temp])
          ]),
          h('div', { className: 'flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, ['Pressure']),
            h('strong', { className: 'font-semibold text-slate-900' }, [`${m.last_reading?.pressure || 0} bar`])
          ]),
          h('div', { className: 'flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, ['Health Score']),
            h('strong', { className: 'font-semibold text-slate-900' }, [`${m.health_score}/100`])
          ])
        ])
      ]),
      h('div', { className: 'flex items-center gap-2 pt-3 border-t border-slate-100' }, [
        h('button', {
          className: 'flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors',
          onClick: () => navigate('/machine.html')
        }, ['Inspect Nodes']),
        h('button', {
          className: 'py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors',
          onClick: () => navigate('/maintenance.html')
        }, ['Schedule'])
      ])
    ]);
  });

  const topControls = h('div', { className: 'flex flex-wrap justify-between items-center mb-6 gap-4' }, [
    h('div', {}, [
      h('h2', { className: 'text-2xl font-bold text-slate-900 font-headline-md tracking-tight m-0' }, ['Industrial Operational Dashboard']),
      h('p', { className: 'text-xs text-slate-500 m-0 mt-1' }, ['Real-time OT Telemetry & Equipment Surveillance'])
    ]),
    h('div', { className: 'flex items-center gap-3' }, [
      h('select', {
        className: 'bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500',
        onChange: (e) => {
          currentFilter = e.target.value;
          renderApp();
        }
      }, [
        h('option', { value: 'ALL', selected: currentFilter === 'ALL' }, ['All Plants']),
        h('option', { value: 'Plant A', selected: currentFilter === 'Plant A' }, ['Plant A']),
        h('option', { value: 'Plant B', selected: currentFilter === 'Plant B' }, ['Plant B'])
      ]),
      h('button', {
        className: 'flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all',
        onClick: async () => {
          allMachines = await getMachinesStatus();
          renderApp();
          alert('Telemetry metrics refreshed successfully!');
        }
      }, [
        h('span', { className: 'material-symbols-outlined text-sm' }, ['refresh']),
        h('span', {}, ['Refresh Data'])
      ])
    ])
  ]);

  return h('div', {}, [
    topControls,
    kpiRow,
    h('div', { className: 'flex items-center justify-between mb-4' }, [
      h('h3', { className: 'text-lg font-bold text-slate-900 font-headline-md m-0' }, ['Monitored Equipment Overview']),
      h('span', { className: 'text-xs text-slate-500 font-medium' }, [`Showing ${filteredMachines.length} node(s)`])
    ]),
    h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, cards)
  ]);
}

function renderApp() {
  const content = renderDashboardContent(allMachines);
  const shell = renderShell('/dashboard.html', content);
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
