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
import { RouterLink } from '@angular/router';

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

  // build 3× dataset for infinite loop
  ngOnChanges(changes: SimpleChanges): void {
    if (this.items && this.items.length) {
      this.loopedItems = [
        ...this.items.map(i => ({ ...i, _clone: true })),
        ...this.items,
        ...this.items.map(i => ({ ...i, _clone: true }))
      ];
      // allow re-init when items change
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
     CAROUSEL LOGIC — cloned from Region carousel
  ----------------------------------------------------*/
  async initCarousel() {
    let ticking = false;
    let loopLock = false;
    let firstScroll = true;
    let lastScrollLeft = 0;

    if (this.carouselInitialized) return;
    this.carouselInitialized = true;

    const row = this.relatedRow?.nativeElement as HTMLElement | null;
    const cards = Array.from(row?.querySelectorAll('.related-card') ?? []) as HTMLElement[];

    if (!row || cards.length === 0) return;

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    row.classList.add('carousel-no-anim');

    const total = cards.length;          // 3 × N
    const loopSize = Math.floor(total / 3); // N
    const loopStart = loopSize;         // middle block start
    const loopEnd = loopSize * 2;       // middle block end
    let current = Math.max(loopStart, 0);
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

    // initial center
    scrollToCard(current, 'auto');
    updateActiveCard();
    updateCardTransforms();

    const leftArrow = row.parentElement?.querySelector('.carousel-arrow.left') as HTMLElement | null;
    const rightArrow = row.parentElement?.querySelector('.carousel-arrow.right') as HTMLElement | null;

    if (leftArrow) leftArrow.onclick = () => scrollToCard(current - 1);
    if (rightArrow) rightArrow.onclick = () => scrollToCard(current + 1);

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

    row.addEventListener('scroll', () => {
      if (loopLock) return;

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
