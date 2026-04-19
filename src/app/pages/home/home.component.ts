import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  effect,
  signal
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LayoutService } from '../../services/services';
import { authProfile } from '../../store/auth.store';
import { TranslateModule } from '@ngx-translate/core';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card';
import { LogoAnimationService } from '../../services/logo-animation.service';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, TranslateModule, DiscoverCardComponent] 
})
export class HomeComponent implements AfterViewInit {

  profile = authProfile;
  isHome = true; // Home page is always "home"


  private animationsStarted = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private layout: LayoutService,
    private router: Router,
    private logoService: LogoAnimationService
  ) {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.layout.ready()) return;
      if (this.animationsStarted()) return;

      this.animationsStarted.set(true);
      this.initAnimations();
    });
  }
      
  animateAndGo({ region, category, slug, next }: any) {
  // Start logo animation immediately
  this.logoService.trigger();

  const route = ['/region', region];
  if (category) route.push(category);
  if (slug) route.push(slug);
  if (next) route.push(next);

  // Navigate immediately (no delay)
  this.router.navigate(route);
}

ngOnInit() {
  const img = new Image();
  img.src = 'images/discover-region-hero.webp';
  this.logoService.reverse();
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
