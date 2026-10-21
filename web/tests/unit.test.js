import { describe, it, expect } from 'vitest';
import { h } from '../src/shared/dom.js';
import {
  evaluateAlertRule,
  checkRBACPermission,
  validateThreshold,
  calculateUnreadNotifications,
  parseGlobalSearchQuery
} from '../src/shared/logic.js';

describe('DOM Helper', () => {
  it('creates an element with props and children', () => {
    const el = h('div', { className: 'test', id: 'my-div' }, ['Hello']);
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('test');
    expect(el.id).toBe('my-div');
    expect(el.textContent).toBe('Hello');
  });

  it('safely escapes text content', () => {
    const malicious = '<script>alert(1)</script>';
    const el = h('span', {}, [malicious]);
    expect(el.innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('does not create inline event-handler attributes from strings', () => {
    const el = h('img', { onerror: 'alert(1)' });
    expect(el.getAttribute('onerror')).toBeNull();
  });

  it('rejects dangerous URL schemes and HTML injection attributes', () => {
    const link = h('a', { href: 'javascript:alert(1)', srcdoc: '<script>alert(1)</script>' });
    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('srcdoc')).toBeNull();

    const dataImage = h('img', { src: 'data:text/html,<script>alert(1)</script>' });
    expect(dataImage.getAttribute('src')).toBeNull();
  });
});

describe('Alert Rule Evaluator', () => {
  const rule = {
    id: 1,
    name: 'High Temp Alert',
    machine: 'CNC-Mill-01',
    metric: 'temperature',
    operator: '>',
    threshold: 80,
    severity: 'HIGH',
    enabled: true
  };

  it('evaluates threshold > correctly when triggered', () => {
    const reading = { machine_id: 'CNC-Mill-01', temperature: 85.5 };
    const res = evaluateAlertRule(rule, reading);
    expect(res).not.toBeNull();
    expect(res.severity).toBe('HIGH');
  });

  it('does not trigger when condition is not met', () => {
    const reading = { machine_id: 'CNC-Mill-01', temperature: 75.0 };
    const res = evaluateAlertRule(rule, reading);
    expect(res).toBeNull();
  });

  it('ignores disabled rules', () => {
    const disabledRule = { ...rule, enabled: false };
    const reading = { machine_id: 'CNC-Mill-01', temperature: 95.0 };
    expect(evaluateAlertRule(disabledRule, reading)).toBeNull();
  });
});

describe('RBAC Permission Matrix', () => {
  it('allows Admin to perform admin actions', () => {
    expect(checkRBACPermission('Admin', 'users:manage')).toBe(true);
    expect(checkRBACPermission('Admin', 'rules:create')).toBe(true);
  });

  it('restricts Engineer from user management', () => {
    expect(checkRBACPermission('Engineer', 'users:manage')).toBe(false);
    expect(checkRBACPermission('Engineer', 'rules:create')).toBe(true);
  });

  it('enforces Auditor maker-checker approval role', () => {
    expect(checkRBACPermission('Auditor', 'thresholds:approve')).toBe(true);
    expect(checkRBACPermission('Auditor', 'rules:create')).toBe(false);
  });
});

describe('Threshold Validator', () => {
  it('validates min < max logic', () => {
    const valid = validateThreshold('temperature', 20, 90);
    expect(valid.valid).toBe(true);

    const invalid = validateThreshold('temperature', 100, 50);
    expect(invalid.valid).toBe(false);
    expect(invalid.error).toContain('strictly less');
  });

  it('checks physical bounds', () => {
    const outOfBounds = validateThreshold('pressure', 0, 99999);
    expect(outOfBounds.valid).toBe(false);
    expect(outOfBounds.error).toContain('physical range');
  });
});

describe('Notification Unread Count', () => {
  it('counts unread notifications correctly', () => {
    const list = [
      { id: 1, read: false },
      { id: 2, read: true },
      { id: 3, read: false }
    ];
    expect(calculateUnreadNotifications(list)).toBe(2);
  });
});

describe('Global Search Parser', () => {
  it('parses prefixed search queries', () => {
    const parsed = parseGlobalSearchQuery('machine:CNC-Mill-01');
    expect(parsed.category).toBe('MACHINE');
    expect(parsed.term).toBe('CNC-Mill-01');
  });

  it('parses raw query as ALL category', () => {
    const parsed = parseGlobalSearchQuery('Hydraulic');
    expect(parsed.category).toBe('ALL');
    expect(parsed.term).toBe('Hydraulic');
  });
});

