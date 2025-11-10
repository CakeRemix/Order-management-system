# CakeRemix — Homepage (static)

This folder contains a static, plain HTML/CSS/JS homepage prototype for the Order-management-system project.

How to run
- Open `index.html` in your browser (double-click or use "Open File...").
- For a local dev server (recommended), run a simple HTTP server in the project root. Example (PowerShell):

```powershell
# from the project folder
python -m http.server 5173; # then open http://localhost:5173
```

What I added
- `index.html` — homepage with header, hero, features, contact form, footer
- `css/styles.css` — mobile-first responsive styling
- `js/main.js` — small JS for nav toggle and footer year

Next steps
- Hook the contact form to a backend endpoint (or a mock).
- Add real logos, copy and images.
- Commit the files on a feature branch and open a PR when ready.
