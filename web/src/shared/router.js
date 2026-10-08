export async function navigate(path) {
  const res = await fetch(path);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  document.body.innerHTML = doc.body.innerHTML;
  
  const scriptMatch = html.match(/src="(\/src\/views\/[^"]+)"/);
  if (scriptMatch) {
    import(scriptMatch[1] + "?t=" + Date.now());
  }
  
  window.history.pushState({}, '', path);
}

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});

document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (link && link.origin === window.location.origin) {
    e.preventDefault();
    navigate(link.pathname);
  }
});
