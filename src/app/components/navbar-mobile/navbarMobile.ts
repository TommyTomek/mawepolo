import { Component } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/i18n/language.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
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

  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';
  isLanguageHovered = false;

  // IMPORTANT: this controls the animation
  logoAnimating = false;

  constructor(
  private lang: LanguageService,
  private cdr: ChangeDetectorRef,
  private router: Router,
  private logoService: LogoAnimationService
) {
  // Listen for global animation trigger
  this.logoService.trigger$.subscribe(() => {
    this.animateLogo();
  });
  this.logoService.reverse$.subscribe(() => {
  this.animateLogoReverse();
});
}


  // Optional route-based animation
  handleRouteChange(url: string) {
    if (url.startsWith('/region/')) {
      // Only animate if not already animating from click
      if (!this.logoAnimating) {
        this.animateLogo();
      }
    }
  }

  // 🔥 This is the method you will call BEFORE navigation
  public triggerLogoAnimation() {
    this.animateLogo();
  }

  private animateLogo() {
    this.logoAnimating = true;
  }
  
  animateLogoReverse() {
  this.logoAnimating = false; // ensure hide class is off
  this.logoReversing = true;

  setTimeout(() => {
    this.logoReversing = false;
  }, 600);
}
logoReversing = false;


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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'mawepolo.vercel.app',
        text: 'Check this out!',
        url: window.location.href
      }).catch(err => console.error('Share failed:', err));
    } else {
      alert('Sharing is not supported on this device');
    }
  }

  onLangEnter() {
    this.isLanguageHovered = true;
  }

  onLangLeave() {
    this.isLanguageHovered = false;
  }
}
