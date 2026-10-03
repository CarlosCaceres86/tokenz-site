# Tokenz — web pública

Sitio estático de presentación de Tokenz, con una demo independiente del tablero. No contiene el código móvil ni el backend.

- Web: https://carloscaceres86.github.io/tokenz-site/
- Repositorio público del sitio: https://github.com/CarlosCaceres86/tokenz-site
- Publicación: GitHub Pages mediante GitHub Actions.

## Desarrollo y comprobaciones

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/demo.test.mjs
python3 scripts/check_site.py
```

Prueba de navegador con Playwright y Chrome instalados:

```sh
PLAYWRIGHT_MODULE=/ruta/a/node_modules/playwright \
CHROME_EXECUTABLE=/ruta/al/binario/chrome \
  node scripts/browser-smoke.mjs http://127.0.0.1:4173/ /tmp/tokenz-web-evidence
```

La demo funciona solo en memoria. No usa cuentas, formularios, backend, cookies, almacenamiento local ni analítica añadida. Las incidencias del sitio son públicas; no incluyas datos personales en ellas.
