import { Component, AfterViewInit, Inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LayoutService } from '../../services/services';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink]
})
export class HomeComponent implements AfterViewInit {

  private animationsStarted = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private layout: LayoutService
  ) {

    // ⭐ effect must be created in constructor
    effect(() => {

      // Only run in browser
      if (!isPlatformBrowser(this.platformId)) return;

      // Wait until layout is ready
      if (!this.layout.ready()) return;

      // Prevent multiple triggers
      if (this.animationsStarted()) return;

      this.animationsStarted.set(true);

      // Now run animations
      this.initAnimations();
    });
  }

  ngAfterViewInit() {
    // nothing here
  }

  private initAnimations() {
    window.scrollTo(0, 0);

    setTimeout(() => {
      requestAnimationFrame(() => {

        const sections = document.querySelectorAll('.snap-section');

        if (sections.length > 0) {
          sections[0].classList.add('is-visible');
        }

        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            } else {
              entry.target.classList.remove('is-visible');
            }
          });
        }, { threshold: 0.4 });

        sections.forEach(sec => observer.observe(sec));

      });
    }, 0);
  }
}
