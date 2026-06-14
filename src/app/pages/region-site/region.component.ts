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
  private carouselInitialized = false;

  
  region!: Region;
  regionName!: string;

  constructor(
    private router: Router,
    
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
     const el = document.querySelector('.discover-region-wrapper');
     if (el) el.scrollTop = 0;
  }

  /* ---------------------------------------------------
     CAROUSEL LOGIC — JS BLUR + SCALE
  ----------------------------------------------------*/
initCarousel() {
  let ticking = false;
  let loopLock = false;
  if (this.carouselInitialized) return;
  this.carouselInitialized = true;

  const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
  const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];

  if (!row || cards.length === 0) return;

  // Disable animations on first load
  row.classList.add('carousel-no-anim');

  const total = cards.length;


  let current = 5; // start from 5th card
  let scrollTimeout: any;

  const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
    current = Math.max(0, Math.min(total - 1, index));
    cards[current].scrollIntoView({
      behavior,
      inline: 'center',
      block: 'nearest'
    });
  };
  const updateActiveCard = () => {
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === current);
    });
  };
  const updateCardTransforms = () => {
    const viewportCenter = window.innerWidth / 2;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      const maxDistance = window.innerWidth * 0.45;

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

  // --- INITIAL POSITION (NO ANIMATION) ---

  scrollToCard(current, 'auto');
  updateActiveCard();
  updateCardTransforms();



  

  

  // ARROWS
  const leftArrow = document.querySelector('.carousel-arrow.left') as HTMLElement | null;
  const rightArrow = document.querySelector('.carousel-arrow.right') as HTMLElement | null;

  if (leftArrow) {
    leftArrow.onclick = () => {
      scrollToCard(current - 1);
    };
  }

  if (rightArrow) {
    rightArrow.onclick = () => {
      scrollToCard(current + 1);
    };
  }

  // TOUCH SWIPE
  let startX = 0;

  row.ontouchstart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
  };

  row.ontouchend = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        scrollToCard(current + 1);
      } else {
        scrollToCard(current - 1);
      }
    }
  };
  let firstScroll = true;
  // SCROLL HANDLER — detect center and update state
  row.addEventListener('scroll', () => {
    if (loopLock) return;
    console.log(current);





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

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      let closestIndex = 0;
      let closestDistance = Infinity;
      const viewportCenter = window.innerWidth / 2;

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

      if (current > 9) {
    loopLock = true;
    row.classList.add('carousel-no-anim');

    current = current - 5;
    scrollToCard(current, 'auto');
    updateActiveCard();
    updateCardTransforms();

    requestAnimationFrame(() => {
      row.classList.remove('carousel-no-anim');
      loopLock = false;
    });

    return;
  }
      if (current < 5) {
    loopLock = true;
    row.classList.add('carousel-no-anim');

    current = current + 5;
    scrollToCard(current, 'auto');
    updateActiveCard();
    updateCardTransforms();

    requestAnimationFrame(() => {
      row.classList.remove('carousel-no-anim');
      loopLock = false;
    });

    return;
  }

    }, 80);
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
