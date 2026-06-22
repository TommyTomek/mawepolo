import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js';

// Disattiva il ripristino automatico dello scroll del browser
// (altrimenti interferisce con i nostri reset manuali nei componenti)
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

function updateVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  );
}
updateVH();
window.addEventListener('resize', updateVH);