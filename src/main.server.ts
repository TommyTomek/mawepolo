import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import 'zone.js/node';
import { provideServerRendering } from '@angular/platform-server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, {
    ...config,
    providers: [
      ...(config.providers ?? []),
      provideServerRendering()
    ]
  }, context);

export default bootstrap;
