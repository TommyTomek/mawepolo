import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RegionService } from '../../services/region.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Region } from '../../types/region';

@Component({
  selector: 'app-region',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss'],
})
export class RegionComponent implements AfterViewInit {

  private route = inject(ActivatedRoute);
  private regionService = inject(RegionService);
  private lang = inject(LanguageService);

  region!: Region;
  regionName!: string;

  constructor() {
    // Read region from route
    this.regionName = this.route.snapshot.paramMap.get('region')!;
    
    // Load initial region (from resolver)
    this.region = this.route.snapshot.data['region'];

    // React to language changes
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
     CAROUSEL LOGIC (unchanged, just moved to a function)
  ----------------------------------------------------*/
  initCarousel() {
    const row = document.querySelector('.dv-scroll-row') as HTMLElement | null;
    const cards = Array.from(document.querySelectorAll('.dv-scroll-row .dv-card')) as HTMLElement[];

    if (!row || cards.length === 0) {
      console.warn('[region] Carousel DOM not found');
      return;
    }

    const original = this.region.cities.length;
    const total = cards.length;

    let current = original + 1;

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
      cards[index].scrollIntoView({
        behavior,
        inline: 'center',
        block: 'nearest'
      });
    };

    scrollToCard(current, 'auto');

    const leftArrow = document.querySelector('.carousel-arrow.left') as HTMLElement | null;
    const rightArrow = document.querySelector('.carousel-arrow.right') as HTMLElement | null;

    if (leftArrow) {
      leftArrow.onclick = () => {
        current = Math.max(0, current - 1);
        scrollToCard(current);
      };
    }

    if (rightArrow) {
      rightArrow.onclick = () => {
        current = Math.min(total - 1, current + 1);
        scrollToCard(current);
      };
    }

    let startX = 0;

    row.ontouchstart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    row.ontouchend = (e: TouchEvent) => {
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
    };

    let scrollTimeout: any;

    row.onscroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
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

        if (current >= total - original - 1) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          return;
        }

        if (current <= original) {
          current = original + (current % original);
          scrollToCard(current, 'auto');
          return;
        }

        scrollToCard(current);

      }, 120);
    };
  }
}
