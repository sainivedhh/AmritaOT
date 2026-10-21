const VIEW_MODULES = Object.freeze({
  "/index.html": "/src/views/login.js",
  "/dashboard.html": "/src/views/dashboard.js",
  "/machine.html": "/src/views/machine.js",
  "/alerts.html": "/src/views/alerts.js",
  "/rules.html": "/src/views/rules.js",
  "/thresholds.html": "/src/views/thresholds.js",
  "/maintenance.html": "/src/views/maintenance.js",
  "/audit.html": "/src/views/audit.js",
  "/users.html": "/src/views/users.js",
  "/reports.html": "/src/views/reports.js",
  "/integrations.html": "/src/views/integrations.js",
  "/settings.html": "/src/views/settings.js",
});

export async function navigate(path) {
  const destination = new URL(path, window.location.origin);
  const modulePath = VIEW_MODULES[destination.pathname];

  if (destination.origin !== window.location.origin || !modulePath) {
    return;
  }

  const response = await fetch(destination.pathname);
  if (!response.ok) {
    throw new Error(`Unable to load page (${response.status})`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(html, "text/html");

  // Move parsed nodes into the current document without using an HTML string sink.
  document.body.replaceChildren(...Array.from(parsedDocument.body.childNodes));
  document.title = parsedDocument.title;

  await import(`${modulePath}?t=${Date.now()}`);
  window.history.pushState({}, "", destination.pathname);
}

window.addEventListener("popstate", () => {
  navigate(window.location.pathname).catch(() => {
    window.location.assign(window.location.pathname);
  });
});

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const link = event.target.closest("a");
  if (!link || link.target || link.hasAttribute("download")) {
    return;
  }

  const destination = new URL(link.href, window.location.origin);
  if (
    destination.origin !== window.location.origin ||
    !Object.hasOwn(VIEW_MODULES, destination.pathname)
  ) {
    return;
  }

  event.preventDefault();
  navigate(destination.pathname).catch(() => {
    window.location.assign(destination.pathname);
  });
});
