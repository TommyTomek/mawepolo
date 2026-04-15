import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { LanguageService } from '../../app/core/i18n/language.service';

@Injectable({ providedIn: 'root' })
export class RegionService {

  constructor(
    private translate: TranslateService,
    private lang: LanguageService
  ) {}

  getRegion(region: string): Observable<any> {
    const lang = this.lang.get();

    console.log(`[RegionService] Loading region "${region}" in language "${lang}"`);

    return this.translate.get(region).pipe(
      map(data => {
        if (!data) {
          console.error(`[RegionService] Region "${region}" not found in translations`);
          return null;
        }

        // Normalize all dictionary-like sections into arrays
        return {
          ...data,
          cities: Object.values(data.cities || {}),
          territory: Object.values(data.territory || {}),
          gastronomy: Object.values(data.gastronomy || {}),
          culture: Object.values(data.culture || {}),
          economy: Object.values(data.economy || {})
        };
      })
    );
  }
}
