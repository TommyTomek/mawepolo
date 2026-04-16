import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  effect,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LayoutService } from '../../services/services';
import { authProfile } from '../../store/auth.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, TranslateModule] 
})
export class HomeComponent implements AfterViewInit {

  profile = authProfile;

  private animationsStarted = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private layout: LayoutService
  ) {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.layout.ready()) return;
      if (this.animationsStarted()) return;

      this.animationsStarted.set(true);
      this.initAnimations();
    });
  }

  ngAfterViewInit() {}

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
