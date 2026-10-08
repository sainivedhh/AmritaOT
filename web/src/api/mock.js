export async function mockLogin(username) {
  const role = username === 'admin' ? 'admin' : (username === 'auditor' ? 'auditor' : 'engineer');
  // Fake JWT: header.payload.signature
  const payload = btoa(JSON.stringify({ sub: username, role: role, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return { token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.signature` };
}

export async function mockGetMachines() {
  return [
    {
      id: "CNC-Mill-01",
      name: "Main CNC Mill",
      status: "RUNNING",
      last_reading: { temperature: 45.2, pressure: 120, vibration: 12, power: 300, ts: Date.now()/1000 }
    },
    {
      id: "Hydraulic-Press-03",
      name: "Press Line A",
      status: "FAULT",
      last_reading: { temperature: 89.0, pressure: 2100, vibration: 45, power: 800, ts: Date.now()/1000 }
    }
  ];
}

export async function mockGetAlerts() {
  return [
    { id: 1, machine_id: "Hydraulic-Press-03", metric: "pressure", value: 2100, severity: "HIGH", state: "OPEN" }
  ];
}
