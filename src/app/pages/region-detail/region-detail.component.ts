import { Component, inject, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-region-detail',
  standalone: true,
  imports: [
    CommonModule,
    DiscoverCardComponent,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './region-detail.component.html',
  styleUrls: ['./region-detail.component.scss']
})
export class RegionDetailComponent {

  private route = inject(ActivatedRoute);
  private regionService = inject(RegionService);
  private lang = inject(LanguageService);

  region: any = null;       // from getRegion()
  detail: any = null;       // from getRegionDetail()
  category!: string;
  regionSlug!: string;
  itemSlug!: string;

  constructor() {
    this.regionSlug = this.route.snapshot.paramMap.get('region')!;
    this.category = this.route.snapshot.paramMap.get('category')!;
    this.itemSlug = this.route.snapshot.paramMap.get('slug')!;

    // React to language changes automatically
    effect(() => {
      const currentLang = this.lang.currentLang();
      this.reload(currentLang);
    });
  }

  /* ---------------------------------------------------
     LOAD REGION + DETAIL
  ----------------------------------------------------*/
  reload(lang: string) {
    // Load region list (cities, gastronomy, etc.)
    this.regionService.getRegion(this.regionSlug).subscribe(region => {
      this.region = region;
    });

    // Load detail content (blocks, description, related)
    this.regionService.getRegionDetail(this.regionSlug, this.itemSlug)
      .subscribe(detail => {
        this.detail = detail;
      });
  }
  getHeroItem() {
    if (!this.region || !this.region[this.category]) return null;
    return this.region[this.category].find((x: any) => x.slug === this.itemSlug);
  }

  getItemBySlug(slug: string) {
    if (!this.region || !this.region[this.category]) return null;
    return this.region[this.category].find((x: any) => x.slug === slug);
  }


}
