const VIEW_PATHS = new Set([
  "/index.html",
  "/dashboard.html",
  "/machine.html",
  "/alerts.html",
  "/rules.html",
  "/thresholds.html",
  "/maintenance.html",
  "/audit.html",
  "/users.html",
  "/reports.html",
  "/integrations.html",
  "/settings.html",
]);

export function navigate(path) {
  let destination;
  try {
    destination = new URL(path, window.location.origin);
  } catch {
    return;
  }

  if (destination.origin !== window.location.origin || !VIEW_PATHS.has(destination.pathname)) {
    return;
  }

  // These are static multi-page routes; let the browser parse the document normally.
  window.location.assign(destination.pathname);
}

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

  let destination;
  try {
    destination = new URL(link.href, window.location.origin);
  } catch {
    return;
  }

  if (
    destination.origin !== window.location.origin ||
    !VIEW_PATHS.has(destination.pathname)
  ) {
    return;
  }

  event.preventDefault();
  navigate(destination.pathname);
});
