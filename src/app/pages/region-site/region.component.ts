import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Region } from '../../types/region';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card';
@Component({
  selector: 'app-region',
  standalone: true,
  imports: [CommonModule, DiscoverCardComponent],
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss'],
})
export class RegionComponent implements AfterViewInit {

  private route = inject(ActivatedRoute);
  private regionService = inject(RegionService);
  private lang = inject(LanguageService);

  region!: Region;
  regionName!: string;

  constructor(
    private router: Router
  ) {
    this.regionName = this.route.snapshot.paramMap.get('region')!;
    this.region = this.route.snapshot.data['region'];

    effect(() => {
      const currentLang = this.lang.currentLang();
      this.reloadRegion(currentLang);
    });
  }

  reloadRegion(lang: string) {
    this.regionService.getRegion(this.regionName).subscribe(data => {
      this.region = data;
      setTimeout(() => this.initCarousel(), 50);
    });
  }

  ngAfterViewInit(): void {
    this.initCarousel();
  }

  /* ---------------------------------------------------
     CAROUSEL LOGIC — JS BLUR + SCALE
  ----------------------------------------------------*/
  initCarousel() {
    const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
    const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];
    const carouselCards = cards.slice(2);

    if (!row || carouselCards.length === 0) return;

    const original = this.region.cities.length;
    const total = carouselCards.length;

    let current = original + 1;

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
      carouselCards[index].scrollIntoView({
        behavior,
        inline: 'center',
        block: 'nearest'
      });
    };

    const updateActiveCard = () => {
      carouselCards.forEach((card, index) => {
        card.classList.toggle('active', index === current);
      });
    };

    const updateCardTransforms = () => {
      const viewportCenter = window.innerWidth / 2;

      carouselCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(viewportCenter - cardCenter);
        const maxDistance = window.innerWidth * 0.45;

        const t = Math.min(distance / maxDistance, 1); // 0 center, 1 far
        const scale = 1 - t * 0.25;                    // 1 → 0.75
        const opacity = 1 - t * 0.4;                   // 1 → 0.6
        const blur = t * 4;                            // 0 → 4px

        card.style.transform = `scale(${scale})`;
        card.style.opacity = `${opacity}`;

        const img = card.querySelector('.card-image') as HTMLElement | null;
        if (img) img.style.filter = `blur(${blur}px)`;
      });
    };

    // Initial center
    scrollToCard(current, 'auto');
    setTimeout(() => {
      updateActiveCard();
      updateCardTransforms();
    }, 50);

    /* ---------------------------------------------------
       ARROWS
    ----------------------------------------------------*/
    const leftArrow = document.querySelector('.carousel-arrow.left') as HTMLElement | null;
    const rightArrow = document.querySelector('.carousel-arrow.right') as HTMLElement | null;

    if (leftArrow) {
      leftArrow.onclick = () => {
        current = Math.max(0, current - 1);
        scrollToCard(current);
        setTimeout(() => {
          updateActiveCard();
          updateCardTransforms();
        }, 80);
      };
    }

    if (rightArrow) {
      rightArrow.onclick = () => {
        current = Math.min(total - 1, current + 1);
        scrollToCard(current);
        setTimeout(() => {
          updateActiveCard();
          updateCardTransforms();
        }, 80);
      };
    }

    /* ---------------------------------------------------
       TOUCH SWIPE
    ----------------------------------------------------*/
    let startX = 0;

    row.ontouchstart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    row.ontouchend = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        current = diff > 0
          ? Math.min(total - 1, current + 1)
          : Math.max(0, current - 1);

        scrollToCard(current);
        setTimeout(() => {
          updateActiveCard();
          updateCardTransforms();
        }, 80);
      }
    };

    /* ---------------------------------------------------
       INFINITE LOOP + CENTER DETECTION
  ----------------------------------------------------*/
    let scrollTimeout: any;

    row.addEventListener('scroll', () => {
      // live transform while scrolling
      updateCardTransforms();

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        let closestIndex = 0;
        let closestDistance = Infinity;
        const viewportCenter = window.innerWidth / 2;

        carouselCards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(cardCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        current = closestIndex;

        // Infinite loop boundaries
        if (current >= total - original - 1) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          setTimeout(() => {
            updateActiveCard();
            updateCardTransforms();
          }, 50);
          return;
        }

        if (current <= original) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          setTimeout(() => {
            updateActiveCard();
            updateCardTransforms();
          }, 50);
          return;
        }

        scrollToCard(current);
        setTimeout(() => {
          updateActiveCard();
          updateCardTransforms();
        }, 50);

      }, 120);
    });


  }

  animateAndGo({ region, category, slug, next }: any) {
  const route = ['/region', region];

  if (category) route.push(category);
  if (slug) route.push(slug);
  if (next) route.push(next);

  this.router.navigate(route);
  }

}
