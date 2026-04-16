import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  currentLang = signal<'en' | 'pl' | 'it'>('en');

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'pl', 'it']);
    translate.setFallbackLang('en');
    translate.use('en');
  }

  switch(lang: 'en' | 'pl' | 'it') {
    this.currentLang.set(lang);
    this.translate.use(lang);
    this.translate.reloadLang(lang);
  }

  get() {
    return this.currentLang();
  }
}
