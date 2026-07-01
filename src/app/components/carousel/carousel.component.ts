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

  @Output() navigate = new EventEmitter<{
    region: string;
    category: string;
    slug: string;
  }>();

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

  onNavigate(item: RelatedItem) {
    this.navigate.emit({
      region: item.title,
      category: item.category,
      slug: item.slug
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.initCarousel();
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
    let suppressShadow = false;

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
      if (suppressShadow) return;   // ← block scaling during teleport
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(viewportCenter - cardCenter);
        const maxDistance = rowRect.width * 0.85;

        

        const discover = card.querySelector('app-discover-card') as any;
        const img = discover?.imageElement as HTMLElement | undefined;

        if (img) img.style.filter = `blur(${blur}px)`;
      });
    };

    // initial center
    scrollToCard(current, 'auto');
    updateCardTransforms();
    updateActiveCard();
    

    /* ---------------------------------------------------
       AUTO-SCROLL
    ----------------------------------------------------*/
    const goToNextCard = () => {
      let next = current + 1;
      if (next >= loopEnd) next = loopStart;

      autoScrolling = true;
      scrollToCard(next);
      current = next;
      updateActiveCard();
      setTimeout(() => { autoScrolling = false; }, 450);
    };

    let autoScrollTimer: any;

    const startAutoScroll = () => {
      clearInterval(autoScrollTimer);
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

    /* ---------------------------------------------------
       ARROWS
    ----------------------------------------------------*/
    const leftArrow = row.parentElement?.querySelector('.carousel-arrow.left') as HTMLElement | null;
    const rightArrow = row.parentElement?.querySelector('.carousel-arrow.right') as HTMLElement | null;

if (leftArrow) {
  leftArrow.onclick = () => {
    resetAutoScroll();
    autoScrolling = true;

    const next = current - 1;
    row.classList.remove('carousel-no-anim');   // ← FIX
    // ⭐ Make the card active BEFORE scrolling
    current = next;
    updateActiveCard();
    updateCardTransforms();

    scrollToCard(next);

    setTimeout(() => { autoScrolling = false; }, 450);
  };
}

if (rightArrow) {
  rightArrow.onclick = () => {
    resetAutoScroll();
    autoScrolling = true;

    const next = current + 1;
    row.classList.remove('carousel-no-anim');   // ← FIX
    // ⭐ Make the card active BEFORE scrolling
    current = next;
    updateActiveCard();
    updateCardTransforms();

    scrollToCard(next);

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
    let scrollTimeout: any;

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
        let suppressShadow = false;

        if (current > loopMax) {
          loopLock = true;
          row.classList.add('carousel-no-anim');

          current -= loopSize;
          suppressShadow = true;
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
          suppressShadow = true;
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
}
