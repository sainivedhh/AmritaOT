import { h } from './dom.js';
import { logout } from './auth.js';

export function renderShell(activePath, pageContent) {
  const topHeader = h('header', { className: 'fixed top-0 left-0 right-0 h-16 w-full px-6 border-b border-slate-200 bg-white/95 backdrop-blur z-50 flex justify-between items-center select-none shadow-sm' }, [
    h('div', { className: 'flex items-center gap-6' }, [
      h('div', { className: 'flex items-center gap-3' }, [
        h('img', { src: '/src/assets/logo.png', alt: 'AmritaOT Logo', className: 'h-8 w-auto object-contain', onerror: "this.onerror=null; this.src='https://lh3.googleusercontent.com/aida/AEtjO1VWtLOBGTe3rviRxpbTp4xN0zjlukaHppJw-2lApYIpkcHa0yYUdJcr8BaTiEwWFN4p9NtPo0KQ6YJha7f9jksZtVrTiWbvmlT8c1v3cpyWsJNEzNtS-IeAvBKBnfvLjYoEwt-LBFP_b9qaYkK0K_HUEJZDbOLDhOysS8Id4jqvtgEomoGCgeg6ztBBSptGT7dDLIF0RXj1duQKDwqMAx_TpCgj12PBI81DueBbowG9GA';" }),
        h('div', { className: 'flex flex-col' }, [
          h('span', { className: 'font-headline-md text-lg font-bold text-slate-900 tracking-tight' }, ['AmritaOT']),
          h('span', { className: 'text-[11px] text-slate-500 font-medium' }, ['Industrial Monitoring System'])
        ])
      ]),
      h('nav', { className: 'hidden md:flex items-center gap-1 h-16 pl-6 border-l border-slate-200 text-sm font-medium' }, [
        h('a', { href: '/dashboard.html', className: activePath === '/dashboard.html' ? 'px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold' : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors' }, ['Console']),
        h('a', { href: '/machine.html', className: activePath === '/machine.html' ? 'px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold' : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors' }, ['Nodes']),
        h('a', { href: '/integrations.html', className: activePath === '/integrations.html' ? 'px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold' : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors' }, ['Topology']),
        h('a', { href: '/audit.html', className: activePath === '/audit.html' ? 'px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold' : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors' }, ['Logs'])
      ])
    ]),
    h('div', { className: 'flex items-center gap-4' }, [
      h('div', { className: 'hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs' }, [
        h('span', { className: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' }),
        h('span', { className: 'text-emerald-700 font-semibold' }, ['Connected'])
      ]),
      h('button', { className: 'px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 rounded-lg uppercase tracking-wider transition-colors', onClick: () => alert('EMERGENCY STOP DISPATCHED!') }, ['Emergency Stop']),
      h('button', { className: 'px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 rounded-lg transition-colors', id: 'logout-btn' }, ['Logout'])
    ])
  ]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard.html', icon: 'dashboard' },
    { label: 'Machine Telemetry', path: '/machine.html', icon: 'precision_manufacturing' },
    { label: 'Alerts SOC', path: '/alerts.html', icon: 'shield_with_heart', badge: '3 ACT' },
    { label: 'Rule Engine', path: '/rules.html', icon: 'bolt' },
    { label: 'Threshold Config', path: '/thresholds.html', icon: 'tune' },
    { label: 'Maintenance Planner', path: '/maintenance.html', icon: 'event_repeat' },
    { label: 'Compliance Reports', path: '/reports.html', icon: 'description' },
    { label: 'Audit Ledger', path: '/audit.html', icon: 'shield' },
    { label: 'User Management', path: '/users.html', icon: 'manage_accounts' },
    { label: 'Integrations', path: '/integrations.html', icon: 'hub' },
    { label: 'Settings', path: '/settings.html', icon: 'settings' }
  ];

  const sidebarLinks = navItems.map(item => {
    const isActive = activePath === item.path;
    const linkClasses = isActive
      ? 'flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-sm shadow-sm'
      : 'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm';
    
    return h('a', { href: item.path, className: linkClasses }, [
      h('div', { className: 'flex items-center gap-3' }, [
        h('span', { className: 'material-symbols-outlined text-lg opacity-80' }, [item.icon]),
        h('span', {}, [item.label])
      ]),
      item.badge ? h('span', { className: 'px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200' }, [item.badge]) : null
    ]);
  });

  const sidebar = h('aside', { className: 'fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-40 select-none shadow-sm' }, [
    h('div', { className: 'flex flex-col gap-3' }, [
      h('div', { className: 'p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between' }, [
        h('div', {}, [
          h('div', { className: 'font-semibold text-sm text-slate-800' }, ['AmritaOT Core']),
          h('div', { className: 'text-xs text-slate-500' }, ['SOC Cell 04'])
        ]),
        h('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500' })
      ]),
      h('nav', { className: 'flex flex-col gap-1' }, sidebarLinks)
    ]),
    h('div', { className: 'flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500' }, [
      h('button', { className: 'w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200', onClick: () => alert('All Alarms Acknowledged') }, [
        h('span', { className: 'material-symbols-outlined text-sm text-amber-600' }, ['done_all']),
        h('span', {}, ['Acknowledge All'])
      ]),
      h('div', { className: 'flex justify-between items-center px-1 text-slate-500 text-[11px]' }, [
        h('span', {}, ['SYSTEM STATUS']),
        h('span', { className: 'text-emerald-600 font-semibold' }, ['STABLE'])
      ])
    ])
  ]);

  return h('div', { className: 'pt-16 min-h-screen flex w-full bg-slate-50 text-slate-800' }, [
    topHeader,
    sidebar,
    h('main', { className: 'ml-64 flex-1 p-8 min-w-0 font-body-md' }, [pageContent])
  ]);
}

export function setupShellEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}
