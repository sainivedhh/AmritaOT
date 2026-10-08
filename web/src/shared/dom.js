export function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else if (key === 'className') {
      el.className = value;
    } else {
      el.setAttribute(key, value);
    }
  }
  const append = (item) => {
    if (item === null || item === undefined || item === false || item === true) return;
    if (Array.isArray(item)) {
      item.forEach(append);
    } else if (typeof item === 'string' || typeof item === 'number') {
      el.appendChild(document.createTextNode(String(item)));
    } else if (item instanceof Node) {
      el.appendChild(item);
    }
  };
  append(children);
  return el;
}

