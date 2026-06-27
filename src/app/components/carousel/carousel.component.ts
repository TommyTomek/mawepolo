import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { DiscoverCardComponent } from '../discover-card/discover-card';
import { RelatedItem } from '../../types/region-detail.model';

type LoopItem = RelatedItem & { _clone?: boolean };

@Component({
  selector: 'app-related-carousel',
  standalone: true,
  imports: [CommonModule, DiscoverCardComponent],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedCarouselComponent implements AfterViewInit, OnChanges {

  @Input() title!: string;
  @Input() items: RelatedItem[] = [];
  @Input() regionSlug!: string;

  @Output() navigate = new EventEmitter<any>();

  @ViewChild('relatedRow') relatedRow!: ElementRef<HTMLElement>;

  loopedItems: LoopItem[] = [];
  private carouselInitialized = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.items && this.items.length) {
      this.loopedItems = [
        ...this.items.map(i => ({ ...i, _clone: true })),
        ...this.items,
        ...this.items.map(i => ({ ...i, _clone: true }))
      ];
      this.carouselInitialized = false;
    }
  }

  onNavigate(event: any) {
    this.navigate.emit(event);
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.initCarousel();
        this.lazyLoadImages();
      });
    });
  }

  /* ---------------------------------------------------
     CAROUSEL LOGIC — WITH AUTO‑SCROLL
  ----------------------------------------------------*/
  async initCarousel() {
    let ticking = false;
    let loopLock = false;
    let firstScroll = true;
    let lastScrollLeft = 0;
    let autoScrolling = false;


    if (this.carouselInitialized) return;
    this.carouselInitialized = true;

    const row = this.relatedRow?.nativeElement as HTMLElement | null;
    const cards = Array.from(row?.querySelectorAll('.related-card') ?? []) as HTMLElement[];

    if (!row || cards.length === 0) return;

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    row.classList.add('carousel-no-anim');

    const total = cards.length;          
    const loopSize = Math.floor(total / 3);
    const loopStart = loopSize;
    const loopEnd = loopSize * 2;

    let current = Math.max(loopStart, 0);

const goToNextCard = () => {
    let next = current + 1;
    if (next >= loopEnd) next = loopStart;

    autoScrolling = true;                    // ← flag BEFORE scroll
    scrollToCard(next);
    current = next;
    updateActiveCard();
    setTimeout(() => { autoScrolling = false; }, 450); // ← matches scroll duration
  };
let autoScrollTimer: any;

  const startAutoScroll = () => {
    clearInterval(autoScrollTimer);          // ← prevent stacking intervals
    autoScrollTimer = setInterval(goToNextCard, 5000);
  };
  const resetAutoScroll = () => {
    clearInterval(autoScrollTimer);
    setTimeout(startAutoScroll, 3000);
  };
startAutoScroll();

row.addEventListener('touchstart', resetAutoScroll);
(row.parentElement ?? row).addEventListener('mousedown', resetAutoScroll);
row.addEventListener('wheel', resetAutoScroll);


    let scrollTimeout: any;

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
  current = Math.max(0, Math.min(total - 1, index));
  const card = cards[current];
  const left = card.offsetLeft - (row.clientWidth - card.clientWidth) / 2;
  row.scrollTo({ left, behavior });
};

const updateActiveCard = () => {
  cards.forEach((card, index) => {
    card.classList.toggle('active', index === current);
  });
};



    const updateCardTransforms = () => {
      const rowRect = row.getBoundingClientRect();
      const viewportCenter = rowRect.left + rowRect.width / 2;

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(viewportCenter - cardCenter);
        const maxDistance = rowRect.width * 0.85;

        const t = Math.min(distance / maxDistance, 1);
        const scale = 1 - t * 0.12;
        const opacity = 1 - t * 0.35;
        const blur = t * 3;

        card.style.transform = `scale(${scale})`;
        card.style.opacity = `${opacity}`;

        const img = card.querySelector('.card-image') as HTMLElement | null;
        if (img) img.style.filter = `blur(${blur}px)`;
      });
    };

    // initial center
    scrollToCard(current, 'auto');
    updateActiveCard();
    updateCardTransforms();

    /* ---------------------------------------------------
       ARROWS
    ----------------------------------------------------*/
    let leftArrow = row.parentElement?.querySelector('.carousel-arrow.left') as HTMLElement | null;
    let rightArrow = row.parentElement?.querySelector('.carousel-arrow.right') as HTMLElement | null;

  if (leftArrow) {
  leftArrow.onclick = () => {
    resetAutoScroll();          // ← add this
    autoScrolling = true;       // ← add this
    scrollToCard(current - 1);
    setTimeout(() => { autoScrolling = false; }, 450);
  };
}

if (rightArrow) {
  rightArrow.onclick = () => {
    resetAutoScroll();          // ← add this
    autoScrolling = true;
    scrollToCard(current + 1);
    setTimeout(() => { autoScrolling = false; }, 450);
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
        scrollToCard(diff > 0 ? current + 1 : current - 1);
      }
    };

    /* ---------------------------------------------------
       SCROLL HANDLING + INFINITE LOOP
    ----------------------------------------------------*/
    row.addEventListener('scroll', () => {
      if (loopLock) return;
      if (autoScrolling) return;
      lastScrollLeft = row.scrollLeft;

      if (firstScroll) {
        firstScroll = false;
        row.classList.remove('carousel-no-anim');
      }

      if (!ticking) {
        requestAnimationFrame(() => {
          updateCardTransforms();
          ticking = false;
        });
        ticking = true;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (row.scrollLeft !== lastScrollLeft) return;

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

        scrollToCard(current, 'smooth');
        updateActiveCard();
      }, 120);

      updateActiveCard();
    });
  }

  /* ---------------------------------------------------
     LAZY LOAD IMAGES
  ----------------------------------------------------*/
  private lazyLoadImages(): void {
    const images = Array.from(
      document.querySelectorAll('[data-bg].card-image')
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
}
