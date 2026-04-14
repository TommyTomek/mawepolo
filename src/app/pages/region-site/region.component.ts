import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Region } from '../../types/region';

@Component({
  selector: 'app-region',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss'],
})
export class RegionComponent implements AfterViewInit {

  region!: Region;

  constructor(private route: ActivatedRoute) {
    this.region = this.route.snapshot.data['region'];
    console.log('Loaded region:', this.region);
  }

  ngAfterViewInit(): void {

    const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
    const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];

    if (!row || cards.length === 0) {
      console.warn('[region] Carousel DOM not found');
      return;
    }

    /* -----------------------------------------
       INFINITE LOOP INITIALIZATION
    ------------------------------------------*/
    const original = this.region.cities.length;   // dynamic length
    const total = cards.length;                   // 3 copies → original * 3

    // Start in the middle copy
    let current = original + 1;

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
      cards[index].scrollIntoView({
        behavior,
        inline: 'center',
        block: 'nearest'
      });
    };

    // Jump instantly to middle copy
    scrollToCard(current, 'auto');


    /* -----------------------------------------
       ARROWS
    ------------------------------------------*/
    const leftArrow = document.querySelector('.carousel-arrow.left') as HTMLElement | null;
    const rightArrow = document.querySelector('.carousel-arrow.right') as HTMLElement | null;

    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        current = Math.max(0, current - 1);
        scrollToCard(current);
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        current = Math.min(total - 1, current + 1);
        scrollToCard(current);
      });
    }


    /* -----------------------------------------
       SWIPE
    ------------------------------------------*/
    let startX = 0;

    row.addEventListener('touchstart', (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    });

    row.addEventListener('touchend', (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          current = Math.min(total - 1, current + 1);
        } else {
          current = Math.max(0, current - 1);
        }
        scrollToCard(current);
      }
    });


    /* -----------------------------------------
       AUTO-SNAP + INFINITE LOOP TELEPORT
    ------------------------------------------*/
    let scrollTimeout: any;

    row.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {

        // Find closest card to center
        let closestIndex = 0;
        let closestDistance = Infinity;
        const center = window.innerWidth / 2;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(cardCenter - center);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        current = closestIndex;

        // TELEPORT RIGHT
        if (current >= total - original - 1) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          return;
        }

        // TELEPORT LEFT
        if (current <= original) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          return;
        }

        // NORMAL SNAP
        scrollToCard(current);

      }, 120);
    });
  }
}
