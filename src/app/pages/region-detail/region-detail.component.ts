import { Component, inject, effect, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-region-detail',
  standalone: true,
  imports: [
    CommonModule,
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
  private platformId = inject(PLATFORM_ID);

  region: any = null;
  detail: any = null;
  category!: string;
  regionSlug!: string;
  itemSlug!: string;

  constructor() {
    effect(() => {
      const currentLang = this.lang.currentLang();
      this.reload(currentLang);
    });

    this.route.paramMap.subscribe(params => {
      this.regionSlug = params.get('region')!;
      this.category = params.get('category')!;
      this.itemSlug = params.get('slug')!;

      this.reload(this.lang.currentLang());

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          document.querySelector('.detail-wrapper')?.scrollTo({ top: 0 });
          this.lazyLoadImages();
        });
      }
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
    if (!isPlatformBrowser(this.platformId)) return;
    this.lazyLoadImages();
  }

  lazyLoadImages() {
    const images = Array.from(
      document.querySelectorAll('.hero-section, .block-image')
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const bg = el.getAttribute('data-bg');
            if (bg) {
              el.style.backgroundImage = `url(${bg})`;
              el.classList.remove('loading');
              el.classList.add('loaded');
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