import { Component, inject, effect, AfterViewInit } from '@angular/core';
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
export class RegionDetailComponent implements AfterViewInit {

  private route = inject(ActivatedRoute);
  private regionService = inject(RegionService);
  private lang = inject(LanguageService);

  region: any = null;
  detail: any = null;
  category!: string;
  regionSlug!: string;
  itemSlug!: string;

  constructor() {
    this.regionSlug = this.route.snapshot.paramMap.get('region')!;
    this.category = this.route.snapshot.paramMap.get('category')!;
    this.itemSlug = this.route.snapshot.paramMap.get('slug')!;

    effect(() => {
      const currentLang = this.lang.currentLang();
      this.reload(currentLang);
    });
  }

  reload(lang: string) {
    this.regionService.getRegion(this.regionSlug).subscribe(region => {
      this.region = region;
    });

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

  ngAfterViewInit() {
    this.lazyLoadImages();
  }

  lazyLoadImages() {
    const images = Array.from(
      document.querySelectorAll('.hero, .block-image')
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const bg = el.getAttribute('data-bg');

            if (bg) {
              el.style.backgroundImage = `url(${bg})`;
              el.classList.remove('loading');
            }

            observer.unobserve(el);
          }
        });
      },
      { rootMargin: '300px' }
    );

    images.forEach(img => observer.observe(img));
  }
}
