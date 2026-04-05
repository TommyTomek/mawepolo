import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';


export function httpLoaderFactory() {
  return new TranslateHttpLoader(); // ✔️ zero-argument version
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideTranslateHttpLoader(),


    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory
      },
      fallbackLang: 'en'
    }).providers!,
  ],
};
