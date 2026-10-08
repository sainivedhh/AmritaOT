import { getRules, saveRule, deleteRule } from '../api/client.js';
import { h } from '../shared/dom.js';
import { renderShell, setupShellEvents } from '../shared/layout.js';

let allRules = [];

function renderRulesContent(rules) {
  const rows = rules.map(r => {
    const severityClass = r.severity === 'HIGH'
      ? 'px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold'
      : (r.severity === 'WARNING'
        ? 'px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold'
        : 'px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold');

    return h('tr', { className: 'border-b border-slate-100 hover:bg-slate-50 transition-colors' }, [
      h('td', { className: 'py-3 px-4 text-sm font-semibold text-slate-900' }, [r.name]),
      h('td', { className: 'py-3 px-4 text-sm text-slate-700' }, [r.machine || 'ALL']),
      h('td', { className: 'py-3 px-4 text-sm font-mono text-slate-800' }, [`${r.metric} ${r.operator} ${r.threshold}`]),
      h('td', { className: 'py-3 px-4 text-sm' }, [h('span', { className: severityClass }, [r.severity])]),
      h('td', { className: 'py-3 px-4 text-sm' }, [
        h('span', {
          className: r.enabled
            ? 'inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200'
            : 'inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200'
        }, [r.enabled ? 'Active' : 'Disabled'])
      ]),
      h('td', { className: 'py-3 px-4 text-sm' }, [
        h('div', { className: 'flex items-center gap-2' }, [
          h('button', {
            className: 'px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors',
            onClick: () => alert(`Rule Test Execution:\n\nRule: "${r.name}"\nCondition: ${r.metric} ${r.operator} ${r.threshold}\nResult: Triggered 14 times in past 24 hours.`)
          }, ['Test Rule']),
          h('button', {
            className: 'px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors',
            onClick: async () => {
              if (confirm(`Are you sure you want to delete rule "${r.name}"?`)) {
                await deleteRule(r.id);
                allRules = await getRules();
                renderApp();
              }
            }
          }, ['Delete'])
        ])
      ])
    ]);
  });

  const topHeader = h('div', { className: 'flex flex-wrap justify-between items-center mb-6 gap-4' }, [
    h('div', {}, [
      h('h2', { className: 'text-2xl font-bold text-slate-900 font-headline-md tracking-tight m-0' }, ['Alert Rule Engine UI']),
      h('p', { className: 'text-xs text-slate-500 m-0 mt-1' }, ['Configure automated real-time telemetry threshold rules & SOC notifications'])
    ]),
    h('button', {
      className: 'flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all',
      onClick: () => showCreateModal()
    }, [
      h('span', { className: 'material-symbols-outlined text-sm' }, ['add']),
      h('span', {}, ['Create New Rule'])
    ])
  ]);

  return h('div', {}, [
    topHeader,
    h('div', { className: 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden' }, [
      h('table', { className: 'w-full text-left border-collapse text-sm' }, [
        h('thead', { className: 'bg-slate-50 border-b border-slate-200' }, [
          h('tr', {}, [
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Rule Name']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Target Machine']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Condition']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Severity']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Status']),
            h('th', { className: 'py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider' }, ['Actions'])
          ])
        ]),
        h('tbody', {}, rows)
      ])
    ])
  ]);
}

function showCreateModal() {
  const existingModal = document.getElementById('rule-modal');
  if (existingModal) existingModal.remove();

  const modal = h('div', {
    id: 'rule-modal',
    className: 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'
  }, [
    h('div', { className: 'bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-fadeIn' }, [
      h('div', { className: 'flex justify-between items-center border-b border-slate-100 pb-4 mb-4' }, [
        h('div', {}, [
          h('h3', { className: 'text-lg font-bold text-slate-900 font-headline-md m-0' }, ['Create New Alert Rule']),
          h('p', { className: 'text-xs text-slate-500 m-0 mt-0.5' }, ['Define target equipment, metrics, condition operators & severity'])
        ]),
        h('button', {
          className: 'text-slate-400 hover:text-slate-600 text-lg font-bold border-none bg-transparent cursor-pointer',
          onClick: () => modal.remove()
        }, ['✕'])
      ]),

      h('form', {
        id: 'create-rule-form',
        className: 'space-y-4',
        onSubmit: async (e) => {
          e.preventDefault();
          const ruleData = {
            name: document.getElementById('rule-name').value,
            machine: document.getElementById('rule-machine').value,
            metric: document.getElementById('rule-metric').value,
            operator: document.getElementById('rule-operator').value,
            threshold: Number(document.getElementById('rule-threshold').value),
            severity: document.getElementById('rule-severity').value,
            enabled: document.getElementById('rule-enabled').checked
          };

          await saveRule(ruleData);
          allRules = await getRules();
          modal.remove();
          renderApp();
          alert(`Alert rule "${ruleData.name}" created successfully!`);
        }
      }, [
        h('div', {}, [
          h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Rule Name']),
          h('input', {
            id: 'rule-name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Overheat Fault Guard',
            className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
          })
        ]),

        h('div', { className: 'grid grid-cols-2 gap-3' }, [
          h('div', {}, [
            h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Target Machine']),
            h('select', {
              id: 'rule-machine',
              className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
            }, [
              h('option', { value: 'ALL' }, ['ALL MACHINES']),
              h('option', { value: 'CNC-Mill-01' }, ['CNC-Mill-01']),
              h('option', { value: 'Hydraulic-Press-03' }, ['Hydraulic-Press-03']),
              h('option', { value: 'Robotic-Arm-12' }, ['Robotic-Arm-12']),
              h('option', { value: 'Conveyor-Belt-07' }, ['Conveyor-Belt-07']),
              h('option', { value: 'Cooling-Tower-02' }, ['Cooling-Tower-02']),
              h('option', { value: 'Compressor-05' }, ['Compressor-05']),
              h('option', { value: 'Welding-Robot-09' }, ['Welding-Robot-09']),
              h('option', { value: 'Packing-Line-04' }, ['Packing-Line-04'])
            ])
          ]),

          h('div', {}, [
            h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Telemetry Metric']),
            h('select', {
              id: 'rule-metric',
              className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
            }, [
              h('option', { value: 'temperature' }, ['Temperature (°C)']),
              h('option', { value: 'pressure' }, ['Pressure (bar)']),
              h('option', { value: 'vibration' }, ['Vibration (Hz)']),
              h('option', { value: 'power' }, ['Power (kW)'])
            ])
          ])
        ]),

        h('div', { className: 'grid grid-cols-2 gap-3' }, [
          h('div', {}, [
            h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Condition Operator']),
            h('select', {
              id: 'rule-operator',
              className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
            }, [
              h('option', { value: '>' }, ['Greater than (>)']),
              h('option', { value: '<' }, ['Less than (<)']),
              h('option', { value: '>=' }, ['Greater or equal (>=)']),
              h('option', { value: '<=' }, ['Less or equal (<=)']),
              h('option', { value: '==' }, ['Equals (==)'])
            ])
          ]),

          h('div', {}, [
            h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Threshold Limit']),
            h('input', {
              id: 'rule-threshold',
              type: 'number',
              step: 'any',
              required: true,
              value: '80',
              className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
            })
          ])
        ]),

        h('div', { className: 'grid grid-cols-2 gap-3 items-center' }, [
          h('div', {}, [
            h('label', { className: 'block text-xs font-semibold text-slate-600 uppercase mb-1' }, ['Alert Severity']),
            h('select', {
              id: 'rule-severity',
              className: 'w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500'
            }, [
              h('option', { value: 'HIGH' }, ['HIGH (Critical Fault)']),
              h('option', { value: 'WARNING' }, ['WARNING (Cautionary)']),
              h('option', { value: 'INFO' }, ['INFO (Informational)'])
            ])
          ]),

          h('div', { className: 'pt-4 flex items-center gap-2' }, [
            h('input', {
              id: 'rule-enabled',
              type: 'checkbox',
              checked: true,
              className: 'w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500'
            }),
            h('label', { htmlFor: 'rule-enabled', className: 'text-xs font-semibold text-slate-700 cursor-pointer' }, ['Activate Immediately'])
          ])
        ]),

        h('div', { className: 'flex justify-end gap-2 pt-4 border-t border-slate-100' }, [
          h('button', {
            type: 'button',
            className: 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors',
            onClick: () => modal.remove()
          }, ['Cancel']),
          h('button', {
            type: 'submit',
            className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors'
          }, ['Save Alert Rule'])
        ])
      ])
    ])
  ]);

  document.body.appendChild(modal);
}

function renderApp() {
  const content = renderRulesContent(allRules);
  const shell = renderShell('/rules.html', content);
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(shell);
  setupShellEvents();
}

async function init() {
  allRules = await getRules();
  renderApp();
}

init();
