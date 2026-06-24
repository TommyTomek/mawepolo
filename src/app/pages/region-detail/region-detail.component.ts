import {
  Component,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card';
import { RelatedCarouselComponent } from '../../components/carousel/carousel.component';
import { Region } from '../../types/region';
import { RegionDetail, RegionItem, RelatedItem } from '../../types/region-detail.model';

@Component({
  selector: 'app-region-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslateModule, RelatedCarouselComponent],
  templateUrl: './region-detail.component.html',
  styleUrls: ['./region-detail.component.scss'],
})
export class RegionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly regionService = inject(RegionService);
  private readonly lang = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);

  region: Region | null = null;
  detail: RegionDetail | null = null;
  category = '';
  regionSlug = '';
  itemSlug = '';

  constructor() {
    // Single subscription: fires once on init and again when either
    // route params or active language changes — eliminates the double-load
    // that occurred when effect() + paramMap.subscribe() both called reload().
    combineLatest([
      this.route.paramMap,
      toObservable(this.lang.currentLang),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, _lang]) => {
        this.regionSlug = params.get('region') ?? '';
        this.category = params.get('category') ?? '';
        this.itemSlug = params.get('slug') ?? '';
        this.loadData();
        this.scrollToTop();
      });
  }

  // ─── Data loading ────────────────────────────────────────────────────────────

  private loadData(): void {
    this.regionService.getRegion(this.regionSlug).subscribe(region => {
      this.region = region;
      this.updateSeo();
      this.cdr.markForCheck();
    });

    this.regionService.getRegionDetail(this.regionSlug, this.itemSlug).subscribe(detail => {
      this.detail = detail;
      this.cdr.markForCheck();
      if (isPlatformBrowser(this.platformId)) {
        // Double rAF: first frame lets Angular commit the DOM,
        // second frame runs after browser paint — safe for IntersectionObserver.
        requestAnimationFrame(() => requestAnimationFrame(() => this.lazyLoadImages()));
      }
    });
  }

  // ─── SEO ─────────────────────────────────────────────────────────────────────

  private updateSeo(): void {
    const hero = this.getHeroItem();
    if (!hero) return;

    const pageTitle = `${hero.title} — MAWEPOLO`;
    const description = this.detail?.description ?? hero.text;

    this.titleService.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: hero.img });
  }

  // ─── Template helpers ─────────────────────────────────────────────────────────

  getHeroItem(): RegionItem | null {
    if (!this.region || !this.category) return null;
    const items = (this.region as unknown as Record<string, RegionItem[]>)[this.category];
    return items?.find(x => x.slug === this.itemSlug) ?? null;
  }

  getRelatedItems(): RelatedItem[] {
    if (!this.region || !this.category) return [];

    // Cities link to other cities; everything else links to siblings in the same category.
    const items = (this.region as unknown as Record<string, RegionItem[]>)[this.category] ?? [];
    return items
      .filter(item => item.slug !== this.itemSlug)
      .map(item => ({ ...item, category: this.category }));
  }

  navigateToRelated(event: { region: string; category?: string; slug?: string; next?: string }): void {
    if (!event.category || !event.slug) return;
    this.router.navigate(['/region', this.regionSlug, event.category, event.slug]);
  }

  // ─── DOM helpers (browser-only) ───────────────────────────────────────────────

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      document.querySelector('.detail-wrapper')?.scrollTo({ top: 0 });
    });
  }

  private lazyLoadImages(): void {
    const images = Array.from(
      document.querySelectorAll<HTMLElement>('[data-bg].hero-section, [data-bg].block-image, [data-bg].related-card')
    );

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const bg = el.getAttribute('data-bg');
          if (bg) {
            el.style.backgroundImage = `url(${bg})`;
            el.classList.replace('loading', 'loaded');
          }
          observer.unobserve(el);
        }
      },
      { rootMargin: '300px' }
    );

    for (const img of images) observer.observe(img);
  }
  // ─── Related items (non-city) ─────────────────────────────────────────────────
  getAllNonCityItems(): RelatedItem[] {
  if (!this.region) return [];

  const categories = ['territory', 'gastronomy', 'culture', 'economy'];

  return categories
    .flatMap(cat => {
      const items = (this.region as any)[cat] ?? [];
      return items.map((item: any) => ({
        ...item,
        category: cat
      }));
    })
    .filter(item => item.slug !== this.itemSlug);
}
getCarouselItems(): RelatedItem[] {
  if (!this.region) return [];

  const isCity = this.category.startsWith('city');

  console.log('isCity:', isCity, 'category:', this.category, 'itemSlug:', this.itemSlug);

  if (isCity) {
    // Show ONLY cities except the current one
    return this.region.cities
      .filter(c => c.slug !== this.itemSlug)
      .map(c => ({ ...c, category: 'cities' }));
  }

  // Show EVERYTHING except cities
  const categories = ['territory', 'gastronomy', 'culture', 'economy'];

  return categories
    .flatMap(cat => {
      const items = (this.region as any)[cat] ?? [];
      return items.map((item: any) => ({
        ...item,
        category: cat
      }));
    })
    .filter(item => item.slug !== this.itemSlug);
}

}