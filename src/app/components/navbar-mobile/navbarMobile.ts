import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/i18n/language.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LogoAnimationService } from '../../../app/services/logo-animation.service';

@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule, RouterModule],
  templateUrl: './navbarMobile.html',
  styleUrls: ['./navbarMobile.scss']
})
export class NavbarMobileComponent {

  showBackButton = false;
  backTarget: string[] = ['/home']; // NEW

  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';
  isLanguageHovered = false;

  logoAnimating = false;
  logoReversing = false;

  constructor(
    private lang: LanguageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private logoService: LogoAnimationService
  ) {

    // 🔥 Logo exit animation
    this.logoService.trigger$.subscribe(() => {
      this.animateLogo();
    });

    // 🔥 Logo reverse animation
    this.logoService.reverse$.subscribe(() => {
      this.animateLogoReverse();
      this.showBackButton = false;
      this.cdr.detectChanges();
    });

    // 🔥 NEW: show back button after logo disappears
    this.logoService.backButton$.subscribe(() => {
      this.showBackButton = true;
      this.cdr.detectChanges();
    });

    this.logoService.backTarget$.subscribe(route => {
      this.backTarget = route;
    });

    // Optional: detect route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.handleRouteChange(event.urlAfterRedirects);
      });
  }
  
  // -----------------------------
  // 🔵 LOGO ANIMATIONS
  // -----------------------------

  private animateLogo() {
    this.logoAnimating = true;
  }

 animateLogoReverse() {
  console.log('🔄 Reverse animation triggered (logo animating back in)');

  // Force logo to start from hidden state
  this.logoAnimating = true;

  requestAnimationFrame(() => {
    this.logoAnimating = false;
    this.logoReversing = true;

    setTimeout(() => {
      this.logoReversing = false;
    }, 600);
  });
}


  // -----------------------------
  // 🔵 BACK BUTTON LOGIC
  // -----------------------------

  navigateBack() {
  const goingHome = this.backTarget.length === 1 && this.backTarget[0] === '/home';

  if (goingHome) {
    // Tell Home to animate the logo back in
    this.logoService.enableReverseOnHome();
  } else {
    // Coming back from detail → region
    this.logoService.markFromDetail();
  }

  this.router.navigate(this.backTarget);
}



  // -----------------------------
  // 🔵 ROUTE-BASED LOGIC
  // -----------------------------

  handleRouteChange(url: string) {
  if (url.startsWith('/region/')) {
    this.animateLogo();
  }

  if (url === '/home' && this.logoService.consumeReverseOnHome()) {
    this.logoService.reverse();
  }
}


  // -----------------------------
  // 🔵 LANGUAGE MENU
  // -----------------------------

  ngOnInit() {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem('lang');

      if (saved) {
        this.currentLanguage = saved;
        this.lang.switch(saved as 'en' | 'pl' | 'it');
        return;
      }

      const browserLang = navigator.language.split('-')[0];

      this.currentLanguage = ['en', 'it', 'pl'].includes(browserLang)
        ? browserLang
        : 'en';

      this.lang.switch(this.currentLanguage as 'en' | 'pl' | 'it');
      localStorage.setItem('lang', this.currentLanguage);
    });
  }

  toggleLanguageMenu(event: Event) {
    event.stopPropagation();
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  switchLanguage(lang: 'en' | 'pl' | 'it', event: Event) {
    event.stopPropagation();

    this.currentLanguage = lang;
    this.lang.switch(lang);
    localStorage.setItem('lang', lang);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.isLanguageMenuOpen = false;
    }, 50);
  }

  // -----------------------------
  // 🔵 MOBILE MENU
  // -----------------------------

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // -----------------------------
  // 🔵 SHARE
  // -----------------------------

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'mawepolo.vercel.app',
        text: 'Check this out!',
        url: window.location.href
      }).catch(() => {});
    } else {
      alert('Sharing is not supported on this device');
    }
  }

  // -----------------------------
  // 🔵 LANGUAGE HOVER
  // -----------------------------

  onLangEnter() {
    this.isLanguageHovered = true;
  }

  onLangLeave() {
    this.isLanguageHovered = false;
  }

  

}
