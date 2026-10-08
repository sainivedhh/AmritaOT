# AmritaOT Web Frontend

## Prerequisites
- Node.js 18+

## How to run
From the `/iems/web` directory, run:
```bash
npm run go
```
This command installs dependencies, builds the project, starts the dev server on port 5173, and opens your default browser.

## Security Notes
- **JWT Storage:** The JWT is stored strictly in memory within the `src/shared/auth.js` module. It is not saved to localStorage or sessionStorage. As a result, hard-refreshing the page will clear the token and require you to log in again. This trades convenience for absolute protection against XSS token exfiltration.
- **Mock Mode:** Set `VITE_USE_MOCK=true` in `.env` to test the UI without a backend.
- **Content Security Policy:** Strict CSP is enforced in production builds. No inline scripts are permitted.
