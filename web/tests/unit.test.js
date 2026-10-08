import { describe, it, expect } from 'vitest';
import { h } from '../src/shared/dom.js';

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
});
