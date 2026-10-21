export function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (key.toLowerCase().startsWith("on")) {
      if (typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      }
      // Never create inline event-handler attributes from strings or other values.
      continue;
    }

    if (key === "className") {
      el.className = String(value);
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    const attributeName = key.toLowerCase();
    if (attributeName === "srcdoc" || attributeName === "innerhtml" || attributeName === "outerhtml") {
      continue;
    }

    if (["href", "src", "action", "formaction", "xlink:href"].includes(attributeName)) {
      const urlValue = String(value).trim();
      // Permit only local paths, fragments, and HTTPS links for URL-bearing attributes.
      if (
        /^(javascript|data|vbscript):/i.test(urlValue) ||
        /^(?:https?:)?\/\//i.test(urlValue) && !/^https:\/\//i.test(urlValue)
      ) {
        continue;
      }
    }

    el.setAttribute(key, String(value));
  }

  const append = (item) => {
    if (item === null || item === undefined || item === false || item === true) return;
    if (Array.isArray(item)) {
      item.forEach(append);
    } else if (typeof item === "string" || typeof item === "number") {
      el.appendChild(document.createTextNode(String(item)));
    } else if (item instanceof Node) {
      el.appendChild(item);
    }
  };

  append(children);
  return el;
}


export function renderTable(headers, rows, className = "table") {
  return h("table", { className }, [
    h("thead", {}, [
      h("tr", {}, headers.map((header) => h("th", {}, [header]))),
    ]),
    h("tbody", {}, rows),
  ]);
}
