import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { RegionService } from '../services/region.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegionResolver implements Resolve<any> {

  constructor(private regionService: RegionService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const regionId = route.paramMap.get('region')!; // veneto / malopolska

    // 1. Read saved language
    let lang = localStorage.getItem('lang');

    // 2. Detect browser language if none saved
    if (!lang) {
      const browserLang = navigator.language.split('-')[0];
      lang = ['en', 'it', 'pl'].includes(browserLang) ? browserLang : 'en';
      localStorage.setItem('lang', lang);
    }

    // 3. Load JSON from /assets/data/{lang}/{region}.json
    return this.regionService.getRegion(lang, regionId);
  }
}

