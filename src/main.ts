import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js';

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
