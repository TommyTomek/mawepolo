import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-veneto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veneto.component.html',
  styleUrls: ['./veneto.component.scss'],
})
export class VenetoComponent implements AfterViewInit {

  cities = [
    { title: 'Treviso', img: 'images/treviso.webp', text: 'A small gem crossed by canals and medieval arcades.' },
    { title: 'Padua', img: 'images/padova.webp', text: 'A historic university city with ancient traditions.' },
    { title: 'Vicenza', img: 'images/vicenza.webp', text: 'The city of Palladio, Renaissance elegance, UNESCO heritage.' },
    { title: 'Belluno', img: 'images/belluno.webp', text: 'Gateway to the Dolomites, pristine nature and spectacular mountain landscapes.' },
    { title: 'Rovigo', img: 'images/rovigo.webp', text: 'Between the Po and Adige rivers, medieval history and the calm atmosphere of Polesine.' }
  ];

  ngAfterViewInit(): void {
    console.log('[Veneto] ngAfterViewInit');

    const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
    const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];

    console.log('[Veneto] row:', row);
    console.log('[Veneto] cards:', cards.length);

    if (!row || cards.length === 0) {
      console.warn('[Veneto] Carousel DOM not found');
      return;
    }

    /* -----------------------------------------
       INFINITE LOOP INITIALIZATION
    ------------------------------------------*/
    const original = this.cities.length;   // 5
    const total = cards.length;            // 15

    // Start in the middle copy
    let current = original + 1;            // index 6

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
      console.log('[Veneto] scrollToCard', index);
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

    console.log('[Veneto] leftArrow:', !!leftArrow, 'rightArrow:', !!rightArrow);

    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        console.log('[Veneto] left click');
        current = Math.max(0, current - 1);
        scrollToCard(current);
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        console.log('[Veneto] right click');
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
