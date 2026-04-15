import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(
        withRoutes(serverRoutes)
    ),
    // This is the "bridge" that tells the builder about your Prerender params
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
