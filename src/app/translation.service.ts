import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'it', 'pl']);
    translate.setDefaultLang('en');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang;
  }
}
