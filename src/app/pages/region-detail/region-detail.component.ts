import {
  Component,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { RelatedCarouselComponent } from '../../components/carousel/carousel.component';
import { Region } from '../../types/region';
import { RegionDetail, RegionItem, RelatedItem } from '../../types/region-detail.model';
import { LogoAnimationService } from '../../services/logo-animation.service';
@Component({
  selector: 'app-region-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslateModule, RelatedCarouselComponent],
  templateUrl: './region-detail.component.html',
  styleUrls: ['./region-detail.component.scss'],
})
export class RegionDetailComponent implements AfterViewInit {

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

  // ⭐ Floating → Docking Back Button
  @ViewChild('backBtn') backBtn!: ElementRef<HTMLButtonElement>;

  constructor(private logoService: LogoAnimationService) {
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

      if (this.logoService.shouldAnimateOnDetail()) {
        this.logoService.trigger();

        
          this.logoService.showBackButton();
          this.logoService.setBackTarget(['/region', this.regionSlug]);
        
      } else {
        // No animation — logo already hidden
        this.logoService.showBackButton();
        this.logoService.setBackTarget(['/region', this.regionSlug]);
      }


    });
}


  // ───────────────────────────────────────────────────────────────
  // ⭐ Floating → Docking Back Button Logic
  // ───────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    requestAnimationFrame(() => {
      const btn = this.backBtn?.nativeElement;
      if (!btn) return;

      const header = document.querySelector('.mobile-top') as HTMLElement;
      const headerHeight = header?.offsetHeight ?? 64;
      const dockOffset = 5; // 5px below header

      window.addEventListener('scroll', () => {
        const rect = btn.getBoundingClientRect();

        if (rect.top <= headerHeight + dockOffset) {
          btn.classList.add('docked');
        } else {
          btn.classList.remove('docked');
        }
      });
    });
  }

  // ─── Data loading ───────────────────────────────────────────────

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
        requestAnimationFrame(() =>
          requestAnimationFrame(() => this.lazyLoadImages())
        );
      }
    });
  }

  // ─── SEO ─────────────────────────────────────────────────────────

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

  // ─── Template helpers ───────────────────────────────────────────

  getHeroItem(): RegionItem | null {
    if (!this.region || !this.category) return null;
    const items = (this.region as any)[this.category];
    return items?.find((x: RegionItem) => x.slug === this.itemSlug) ?? null;
  }

  getRelatedItems(): RelatedItem[] {
    if (!this.region || !this.category) return [];
    const items = (this.region as any)[this.category] ?? [];
    return items
      .filter((item: any) => item.slug !== this.itemSlug)
      .map((item: any) => ({ ...item, category: this.category }));
  }

  navigateToRelated(event: { region: string; category?: string; slug?: string; next?: string }): void {
    if (!event.category || !event.slug) return;
    this.router.navigate(['/region', this.regionSlug, event.category, event.slug]);
  }
  

  // ─── DOM helpers ────────────────────────────────────────────────

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      document.querySelector('.detail-wrapper')?.scrollTo({ top: 0 });
    });
  }

  private lazyLoadImages(): void {
    const images = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-bg].hero-section, [data-bg].block-image, [data-bg].related-card'
      )
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

  // ─── Related items (non-city) ───────────────────────────────────

  getAllNonCityItems(): RelatedItem[] {
    if (!this.region) return [];
    const categories = ['territory', 'gastronomy', 'culture', 'economy'];

    return categories
      .flatMap(cat => {
        const items = (this.region as any)[cat] ?? [];
        return items.map((item: any) => ({ ...item, category: cat }));
      })
      .filter(item => item.slug !== this.itemSlug);
  }

  getCarouselItems(): RelatedItem[] {
    if (!this.region) return [];

    const isCity = this.category.startsWith('city');

    if (isCity) {
      return this.region.cities
        .filter(c => c.slug !== this.itemSlug)
        .map(c => ({ ...c, category: 'cities' }));
    }

    const categories = ['territory', 'gastronomy', 'culture', 'economy'];

    return categories
      .flatMap(cat => {
        const items = (this.region as any)[cat] ?? [];
        return items.map((item: any) => ({ ...item, category: cat }));
      })
      .filter(item => item.slug !== this.itemSlug);
  }

  
}
