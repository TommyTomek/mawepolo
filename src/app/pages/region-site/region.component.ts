import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Region } from '../../types/region';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card';
import { LogoAnimationService } from '../../services/logo-animation.service';
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
  private carouselInitialized = false;
  private logoService = inject(LogoAnimationService);

  
  region!: Region;
  regionName!: string;

constructor(
  private router: Router,
) {
  effect(() => {
    const currentLang = this.lang.currentLang();
    this.reloadRegion(currentLang);
  });

  this.route.paramMap.subscribe(params => {
    this.regionName = params.get('region')!;
    this.region = this.route.snapshot.data['region'];

    this.reloadRegion(this.lang.currentLang());

    const el = document.querySelector('.discover-region-wrapper');
    if (el) el.scrollTop = 0;
  });
}

  reloadRegion(lang: string) {
  this.regionService.getRegion(this.regionName).subscribe(data => {
    if (!this.logoService.consumeFromDetail()) {
  // Only animate when NOT coming from detail
  this.logoService.trigger();
}


      setTimeout(() => {
        this.logoService.showBackButton();
        this.logoService.setBackTarget(['/home']);
      }, 600);
    
    

    this.region = data;

    // Reset initialization when the view is refreshed with new content.
    this.carouselInitialized = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.initCarousel();
        const el = document.querySelector('.discover-region-wrapper');
        if (el) el.scrollTop = 0;
      });
    });
  });
}

  ngAfterViewInit(): void {
  
  }

  /* ---------------------------------------------------
     CAROUSEL LOGIC — JS BLUR + SCALE
  ----------------------------------------------------*/
async initCarousel() {
  // --- STATE FLAGS ----------------------------------------------------------
  let ticking = false;          // rAF throttle for transforms
  let loopLock = false;         // prevents recursive scroll events during teleport
  let firstScroll = true;       // disables animations only for first scroll
  let lastScrollLeft = 0;       // used to detect true scroll-end on mobile

  if (this.carouselInitialized) return;
  this.carouselInitialized = true;

  // --- ELEMENTS -------------------------------------------------------------
  const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
  const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];

  if (!row || cards.length === 0) return;

  // Wait for the browser to finish layout and painting.
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  // Disable animations on first load (teleport-safe)
  row.classList.add('carousel-no-anim');

  const total = cards.length;
  const loopSize = Math.floor(total / 3);
  const loopStart = loopSize;
  const loopEnd = loopSize * 2;
  let current = Math.max(loopStart, 0);
  let scrollTimeout: any;

  // --- HELPERS --------------------------------------------------------------

  // Scroll to a specific card index
  const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
    current = Math.max(0, Math.min(total - 1, index));
    const card = cards[current];
    const left = card.offsetLeft - (row.clientWidth - card.clientWidth) / 2;

    row.scrollTo({ left, behavior });
  };

  // Highlight the active card
  const updateActiveCard = () => {
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === current);
    });
  };

  // Apply scale/opacity/blur transforms based on distance from center
  const updateCardTransforms = () => {
    const rowRect = row.getBoundingClientRect();
    const viewportCenter = rowRect.left + rowRect.width / 2;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      const maxDistance = rowRect.width * 0.45;

      const t = Math.min(distance / maxDistance, 1);
      const scale = 1 - t * 0.25;
      const opacity = 1 - t * 0.4;
      const blur = t * 4;

      card.style.transform = `scale(${scale})`;
      card.style.opacity = `${opacity}`;

      const img = card.querySelector('.card-image') as HTMLElement | null;
      if (img) img.style.filter = `blur(${blur}px)`;
    });
  };

  // --- INITIAL POSITION (NO ANIMATION) -------------------------------------
  scrollToCard(current, 'auto');
  updateActiveCard();
  updateCardTransforms();

  // --- ARROWS ---------------------------------------------------------------
  const leftArrow = document.querySelector('.carousel-arrow.left') as HTMLElement | null;
  const rightArrow = document.querySelector('.carousel-arrow.right') as HTMLElement | null;

  if (leftArrow) leftArrow.onclick = () => scrollToCard(current - 1);
  if (rightArrow) rightArrow.onclick = () => scrollToCard(current + 1);

  // --- TOUCH SWIPE ----------------------------------------------------------
  let startX = 0;

  row.ontouchstart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
  };

  row.ontouchend = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      scrollToCard(diff > 0 ? current + 1 : current - 1);
    }
  };

  // --- SCROLL HANDLER -------------------------------------------------------
  row.addEventListener('scroll', () => {
    if (loopLock) return;

    lastScrollLeft = row.scrollLeft;

    // Enable animations after first user scroll
    if (firstScroll) {
      firstScroll = false;
      row.classList.remove('carousel-no-anim');
    }

    // Smooth per-frame transforms
    if (!ticking) {
      requestAnimationFrame(() => {
        updateCardTransforms();
        ticking = false;
      });
      ticking = true;
    }

    // Debounced scroll-end detection
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // If scrollLeft changed during debounce, user is still scrolling
      if (row.scrollLeft !== lastScrollLeft) return;

      // Find closest card to center
      const rowRect = row.getBoundingClientRect();
      const viewportCenter = rowRect.left + rowRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      current = closestIndex;
      const loopMin = loopStart;
      const loopMax = loopEnd - 1;

      // --- LOOP TELEPORT LOGIC ----------------------------------------------
      if (current > loopMax) {
        loopLock = true;
        row.classList.add('carousel-no-anim');

        current -= loopSize;
        scrollToCard(current, 'auto');
        updateActiveCard();
        updateCardTransforms();

        requestAnimationFrame(() => {
          row.classList.remove('carousel-no-anim');
          loopLock = false;
        });

        return;
      }

      if (current < loopMin) {
        loopLock = true;
        row.classList.add('carousel-no-anim');

        current += loopSize;
        scrollToCard(current, 'auto');
        updateActiveCard();
        updateCardTransforms();

        requestAnimationFrame(() => {
          row.classList.remove('carousel-no-anim');
          loopLock = false;
        });

        return;
      }

      // Normal snap
      scrollToCard(current, 'smooth');
      updateActiveCard();
    }, 120);

    updateActiveCard();
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
