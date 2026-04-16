import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../app/core/i18n/language.service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeService {

  constructor(
    private translate: TranslateService,
    private lang: LanguageService
  ) {}

  getHome() {
    const lang = this.lang.get();

    console.log(`[HomeService] Loading homepage in language "${lang}"`);

    return this.translate.get('home').pipe(
      map(data => {
        if (!data) {
          console.error('[HomeService] Missing "home" section in translations');
          return null;
        }

        return {
          ...data,
          discover: {
            veneto: data.discover?.veneto || {},
            malopolska: data.discover?.malopolska || {}
          }
        };
      })
    );
  }
}
