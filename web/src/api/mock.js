export async function mockLogin(username, password, mfaCode) {
  const role = username === 'admin' ? 'Admin' : (username === 'auditor' ? 'Auditor' : 'Engineer');
  const payload = btoa(JSON.stringify({ sub: username, role: role, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return {
    token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.signature`,
    user: { username, role },
    mfa_required: false
  };
}

export async function mockGetMachines() {
  return [
    {
      id: "CNC-Mill-01",
      name: "Main CNC Mill",
      plant: "Plant A",
      area: "Machining",
      status: "RUNNING",
      health_score: 94,
      rul_days: 28,
      anomaly_badge: "NORMAL",
      calibration_status: "VALID",
      last_maintenance: "2026-09-20",
      mtbf_hrs: 850,
      mttr_hrs: 3.5,
      last_reading: { temperature: 45.2, pressure: 120, vibration: 12, power: 300, ts: Date.now() / 1000 }
    },
    {
      id: "Hydraulic-Press-03",
      name: "Press Line A",
      plant: "Plant A",
      area: "Stamping",
      status: "FAULT",
      health_score: 58,
      rul_days: 8,
      anomaly_badge: "ANOMALY",
      calibration_status: "DUE",
      last_maintenance: "2026-08-10",
      mtbf_hrs: 420,
      mttr_hrs: 6.0,
      last_reading: { temperature: 89.0, pressure: 2100, vibration: 45, power: 800, ts: Date.now() / 1000 }
    },
    {
      id: "Conveyor-Belt-07",
      name: "Main Transfer Belt",
      plant: "Plant B",
      area: "Assembly",
      status: "RUNNING",
      health_score: 88,
      rul_days: 45,
      anomaly_badge: "NORMAL",
      calibration_status: "VALID",
      last_maintenance: "2026-09-12",
      mtbf_hrs: 1200,
      mttr_hrs: 2.0,
      last_reading: { temperature: 38.5, pressure: 95, vibration: 8, power: 150, ts: Date.now() / 1000 }
    },
    {
      id: "Robotic-Arm-12",
      name: "Welding Arm 12",
      plant: "Plant A",
      area: "Assembly",
      status: "WARNING",
      health_score: 72,
      rul_days: 12,
      anomaly_badge: "WARNING",
      calibration_status: "VALID",
      last_maintenance: "2026-09-01",
      mtbf_hrs: 650,
      mttr_hrs: 4.0,
      last_reading: { temperature: 68.4, pressure: 180, vibration: 22, power: 450, ts: Date.now() / 1000 }
    },
    {
      id: "Cooling-Tower-02",
      name: "Primary Cooling Unit",
      plant: "Plant B",
      area: "Utilities",
      status: "RUNNING",
      health_score: 91,
      rul_days: 60,
      anomaly_badge: "NORMAL",
      calibration_status: "VALID",
      last_maintenance: "2026-09-25",
      mtbf_hrs: 1500,
      mttr_hrs: 1.5,
      last_reading: { temperature: 24.1, pressure: 80, vibration: 5, power: 210, ts: Date.now() / 1000 }
    },
    {
      id: "Compressor-05",
      name: "Air Supply Compressor",
      plant: "Plant B",
      area: "Utilities",
      status: "RUNNING",
      health_score: 85,
      rul_days: 30,
      anomaly_badge: "NORMAL",
      calibration_status: "VALID",
      last_maintenance: "2026-09-18",
      mtbf_hrs: 980,
      mttr_hrs: 3.0,
      last_reading: { temperature: 52.0, pressure: 310, vibration: 15, power: 520, ts: Date.now() / 1000 }
    },
    {
      id: "Welding-Robot-09",
      name: "Cell 9 Welder",
      plant: "Plant A",
      area: "Stamping",
      status: "RUNNING",
      health_score: 96,
      rul_days: 90,
      anomaly_badge: "NORMAL",
      calibration_status: "VALID",
      last_maintenance: "2026-10-01",
      mtbf_hrs: 1100,
      mttr_hrs: 2.5,
      last_reading: { temperature: 42.0, pressure: 115, vibration: 9, power: 340, ts: Date.now() / 1000 }
    },
    {
      id: "Packing-Line-04",
      name: "End of Line Packer",
      plant: "Plant B",
      area: "Packaging",
      status: "WARNING",
      health_score: 65,
      rul_days: 10,
      anomaly_badge: "WARNING",
      calibration_status: "DUE",
      last_maintenance: "2026-08-28",
      mtbf_hrs: 500,
      mttr_hrs: 5.0,
      last_reading: { temperature: 61.2, pressure: 140, vibration: 28, power: 290, ts: Date.now() / 1000 }
    }
  ];
}

export async function mockGetAlerts() {
  return [
    { id: 101, machine_id: "Hydraulic-Press-03", metric: "pressure", value: 2100, severity: "HIGH", state: "OPEN", timestamp: "2026-10-08T10:30:00Z" },
    { id: 102, machine_id: "Robotic-Arm-12", metric: "temperature", value: 68.4, severity: "WARNING", state: "ACKNOWLEDGED", timestamp: "2026-10-08T11:15:00Z" },
    { id: 103, machine_id: "Packing-Line-04", metric: "vibration", value: 28, severity: "WARNING", state: "OPEN", timestamp: "2026-10-08T11:40:00Z" }
  ];
}

let mockRules = [
  { id: "r-1", name: "High Pressure Fault Guard", machine: "Hydraulic-Press-03", metric: "pressure", operator: ">", threshold: 2000, threshold2: null, duration: 5, cooldown: 60, severity: "HIGH", enabled: true, channels: ["in-app", "email"] },
  { id: "r-2", name: "Overheat Warning", machine: "ALL", metric: "temperature", operator: ">", threshold: 75, threshold2: null, duration: 10, cooldown: 120, severity: "WARNING", enabled: true, channels: ["in-app"] }
];

export async function mockGetRules() {
  return [...mockRules];
}

export async function mockSaveRule(rule) {
  if (!rule.id) {
    rule.id = `r-${Date.now()}`;
    mockRules.push(rule);
  } else {
    const idx = mockRules.findIndex(r => r.id === rule.id);
    if (idx >= 0) mockRules[idx] = rule;
  }
  return { success: true, rule };
}

export async function mockDeleteRule(id) {
  mockRules = mockRules.filter(r => r.id !== id);
  return { success: true };
}

let mockNotifications = [
  { id: "n-1", title: "High Pressure Detected", message: "Hydraulic-Press-03 pressure reached 2100 bar", severity: "HIGH", read: false, timestamp: new Date(Date.now() - 300000).toISOString(), machine_id: "Hydraulic-Press-03" },
  { id: "n-2", title: "Predictive Maintenance Alert", message: "Robotic-Arm-12 RUL is less than 14 days", severity: "WARNING", read: false, timestamp: new Date(Date.now() - 900000).toISOString(), machine_id: "Robotic-Arm-12" }
];

export async function mockGetNotifications() {
  return [...mockNotifications];
}

export async function mockMarkNotificationRead(id) {
  if (id === 'all') {
    mockNotifications.forEach(n => n.read = true);
  } else {
    const item = mockNotifications.find(n => n.id === id);
    if (item) item.read = true;
  }
  return { success: true };
}

export async function mockGetWorkOrders() {
  return [
    { id: "WO-101", machine_id: "Hydraulic-Press-03", priority: "HIGH", assignee: "Engineer Alpha", status: "In Progress", sla_due: "2026-10-10", parts: ["Pressure Seal Unit"], history: ["Created by Admin", "Assigned to Eng Alpha"] },
    { id: "WO-102", machine_id: "Packing-Line-04", priority: "MEDIUM", assignee: "Engineer Beta", status: "Open", sla_due: "2026-10-12", parts: ["Belt Bearing #4"], history: ["Created by Auto-Predictive"] },
    { id: "WO-103", machine_id: "Robotic-Arm-12", priority: "LOW", assignee: "Engineer Alpha", status: "Blocked", sla_due: "2026-10-15", parts: ["Servo Motor Assembly"], history: ["Waiting on parts delivery"] }
  ];
}

export async function mockGetThresholdVersions() {
  return [
    { version: "v2.1", proposed_by: "engineer", approved_by: "auditor", status: "APPROVED", timestamp: "2026-10-01", changes: "Updated temp limit to 85°C for CNC-Mill-01" },
    { version: "v2.2-draft", proposed_by: "admin", approved_by: null, status: "PENDING_APPROVAL", timestamp: "2026-10-07", changes: "Propose pressure limit reduction to 1900 bar" }
  ];
}

export async function mockGetAuditLogs() {
  return [
    { id: 1, action: "LOGIN_SUCCESS", user: "admin", timestamp: "2026-10-08T08:00:00Z", prev_hash: "GENESIS", hash: "a8f9c2d1e3f4a5b6c7d8e9f0" },
    { id: 2, action: "RULE_CREATE", user: "engineer", timestamp: "2026-10-08T09:15:00Z", prev_hash: "a8f9c2d1e3f4a5b6c7d8e9f0", hash: "b9e8d7c6b5a4f3e2d1c0b9a8" },
    { id: 3, action: "THRESHOLD_UPDATE", user: "admin", timestamp: "2026-10-08T10:30:00Z", prev_hash: "b9e8d7c6b5a4f3e2d1c0b9a8", hash: "c0d1e2f3a4b5c6d7e8f9a0b1" }
  ];
}

export async function mockGetIntegrations() {
  return [
    { id: "opc-1", name: "Plant A OPC-UA Server", type: "OPC-UA", endpoint: "opc.tcp://192.168.1.10:4840", status: "Connected", latency: "12ms" },
    { id: "mqtt-1", name: "Sensors MQTT Broker", type: "MQTT", endpoint: "mqtt://broker.internal:1883", status: "Connected", latency: "8ms" },
    { id: "modbus-1", name: "Utilities Modbus Gateway", type: "Modbus TCP", endpoint: "192.168.2.50:502", status: "Degraded", latency: "145ms" }
  ];
}

export async function mockGetReports() {
  return [
    { id: "rep-101", title: "IEC 62443 Security Compliance Pack", format: "PDF", generated: "2026-10-01", size: "2.4 MB" },
    { id: "rep-102", title: "Monthly Machine Health & MTBF Summary", format: "CSV", generated: "2026-10-05", size: "850 KB" }
  ];
}
