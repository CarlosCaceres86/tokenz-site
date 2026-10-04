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

## Marca y fidelidad con la app

La web reutiliza las tres poses 2D aprobadas de la mascota: Welcome en cabecera/portada, Guide en la demo y Celebrate en el cierre y el feedback de canje. No genera una familia visual nueva. Inventario en `assets/PROVENANCE.md`.

La portada y la galería muestran capturas nativas sin retocar de la build actual en iPhone 17 Pro / iOS 26.4.1. Su procedencia y estados se registran en `assets/screenshots/PROVENANCE.md`. El fixture ficticio es el mismo que la demo (Ada, normas 2/2/3, recompensa 5).

`app-preview.css` reproduce los tokens y la composición del design system Compose: `BoardHeader`, `WeeklyProgressCard`, `TokenzCategoryTabs`, `BalanceBadge`, `NormCard`/`RewardCard`, `TokenzIllustratedDialog` y `TokenzInlineFeedback`. El header permanece fijo dentro del tablero, el contenido desplaza y las pestañas se mantienen visibles; el check conserva su hueco y respeta Reducir movimiento. En móvil el tablero aprovecha el ancho disponible; a 320 px apila las acciones para conservar la legibilidad.

La demo representa un día de ejemplo y permite marcar/desmarcar, explicar saldo insuficiente y confirmar/cancelar un canje. Mantiene saldo y progreso separados: canjear resta saldo, deshacer revierte lo ganado aunque se haya gastado, y las otras normas siguen utilizables. No representa la cuenta, configuración, sharing ni el backend; el icono de menú es una referencia visual, no un control de navegación de la demo.

Validación de esta revisión: 9 tests de estado, integridad de HTML/CSS/assets, revisión independiente y recorrido manual en navegador (320/390/768/1440 px; teclado, normas, insuficiente, Escape/foco, cancelar, canjear, deshacer tras gastar, reset/recarga y galería). La app de referencia se recompiló y se recorrió en Simulator; `scripts/validate_kmp.sh` pasó (646 tareas). El script `browser-smoke.mjs` conserva esas regresiones para entornos con Playwright; aquí se verificó su sintaxis y se utilizó Computer Use para el recorrido.
