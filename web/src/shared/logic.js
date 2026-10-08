export function evaluateAlertRule(rule, reading) {
  if (!rule.enabled) return null;
  if (rule.machine !== 'ALL' && rule.machine !== reading.machine_id) return null;
  
  const val = reading[rule.metric];
  if (val === undefined || val === null) return null;
  
  let triggered = false;
  const thresh = Number(rule.threshold);
  const thresh2 = Number(rule.threshold2);

  switch (rule.operator) {
    case '>':
      triggered = val > thresh;
      break;
    case '<':
      triggered = val < thresh;
      break;
    case 'between':
      triggered = val >= thresh && val <= thresh2;
      break;
    case 'outside':
      triggered = val < thresh || val > thresh2;
      break;
    case 'rate-of-change':
      if (reading.prev_value !== undefined) {
        triggered = Math.abs(val - reading.prev_value) > thresh;
      }
      break;
    default:
      break;
  }

  if (triggered) {
    return {
      rule_id: rule.id,
      rule_name: rule.name,
      machine_id: reading.machine_id,
      metric: rule.metric,
      value: val,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      channels: rule.channels || ['in-app']
    };
  }

  return null;
}

export function checkRBACPermission(role, permission) {
  const matrix = {
    Admin: [
      'rules:create', 'rules:edit', 'rules:delete',
      'thresholds:propose', 'thresholds:approve', 'thresholds:rollback',
      'users:manage', 'roles:manage', 'settings:manage',
      'maintenance:manage', 'audit:view', 'audit:export', 'reports:generate'
    ],
    Engineer: [
      'rules:create', 'rules:edit',
      'thresholds:propose',
      'maintenance:manage', 'audit:view', 'reports:generate'
    ],
    Auditor: [
      'thresholds:approve',
      'audit:view', 'audit:export', 'reports:generate'
    ]
  };

  const perms = matrix[role] || [];
  return perms.includes(permission);
}

export function verifyAuditChain(logs) {
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return { valid: true, brokenIndex: -1 };
  }

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (i === 0) {
      if (log.prev_hash !== 'GENESIS') {
        return { valid: false, brokenIndex: 0 };
      }
    } else {
      if (log.prev_hash !== logs[i - 1].hash) {
        return { valid: false, brokenIndex: i };
      }
    }
  }

  return { valid: true, brokenIndex: -1 };
}

export function validateThreshold(metric, minVal, maxVal) {
  if (minVal === null || minVal === undefined || maxVal === null || maxVal === undefined) {
    return { valid: false, error: 'Min and Max values are required' };
  }
  const min = Number(minVal);
  const max = Number(maxVal);

  if (isNaN(min) || isNaN(max)) {
    return { valid: false, error: 'Threshold values must be numbers' };
  }
  if (min >= max) {
    return { valid: false, error: 'Min value must be strictly less than Max value' };
  }

  const bounds = {
    temperature: { min: -50, max: 200 },
    pressure: { min: 0, max: 5000 },
    vibration: { min: 0, max: 200 },
    power: { min: 0, max: 5000 }
  };

  if (bounds[metric]) {
    if (min < bounds[metric].min || max > bounds[metric].max) {
      return { valid: false, error: `Values for ${metric} out of physical range` };
    }
  }

  return { valid: true, error: null };
}

export function calculateUnreadNotifications(notifications) {
  if (!Array.isArray(notifications)) return 0;
  return notifications.filter(n => !n.read).length;
}

export function parseGlobalSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { raw: '', category: 'ALL', term: '' };
  }

  const trimmed = query.trim();
  const match = trimmed.match(/^(machine|alert|audit|user):(.*)$/i);
  if (match) {
    return {
      raw: trimmed,
      category: match[1].toUpperCase(),
      term: match[2].trim()
    };
  }

  return {
    raw: trimmed,
    category: 'ALL',
    term: trimmed
  };
}

export function validateMockTOTP(code, secret) {
  if (!code || typeof code !== 'string') return false;
  const cleanCode = code.trim();
  if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) return false;
  // Mock validation rule: accepts '123456' or any code ending in '0' or matching hash of secret length
  if (cleanCode === '123456') return true;
  if (secret && cleanCode.endsWith('0')) return true;
  return false;
}
