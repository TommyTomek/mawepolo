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

  /* -------------------------------------------------------
     LOAD REGION (cities, territory, gastronomy, etc.)
     from translations: { "veneto": { ... }, "malopolska": { ... } }
  ------------------------------------------------------- */
  getRegion(region: string): Observable<any> {
    const lang = this.lang.get();

    return this.translate.get(region).pipe(
      map(data => {
        if (!data) return null;

        return {
          ...data,
          slug: region,
          cities: this.normalizeList(data.cities),
          territory: this.normalizeList(data.territory),
          gastronomy: this.normalizeList(data.gastronomy),
          culture: this.normalizeList(data.culture),
          economy: this.normalizeList(data.economy)
        };
      })
    );
  }

  /* -------------------------------------------------------
     LOAD REGION DETAIL (blocks, description, related)
     from translations: { "veneto-detail": { ... } }
  ------------------------------------------------------- */
  getRegionDetail(region: string, itemSlug: string): Observable<any> {
    const detailKey = `${region}-detail`;

    return this.translate.get(detailKey).pipe(
      map(detailData => {
        if (!detailData) return null;

        const item = detailData[itemSlug];
        if (!item) return null;

        return {
          ...item,
          slug: itemSlug,
          blocks: this.normalizeList(item.blocks || []),
          related: item.related || []
        };
      })
    );
  }

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */
  private normalizeList(list: any[]): any[] {
    if (!Array.isArray(list)) return [];

    return list.map(item => ({
      ...item,
      slug: item.slug || this.slugify(item.title)
    }));
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
