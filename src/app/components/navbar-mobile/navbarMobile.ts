import { Component,HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/i18n/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  templateUrl: './navbarMobile.html',
  styleUrls: ['./navbarMobile.scss']
})
export class NavbarMobileComponent {

  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';

  constructor(private lang: LanguageService) {}

  ngOnInit() {
    const saved = localStorage.getItem('lang');

    if (saved) {
      this.currentLanguage = saved;
      this.lang.switch(saved as 'en' | 'pl' | 'it');
      return;
    }

    const browserLang = navigator.language.split('-')[0];

    if (['en', 'it', 'pl'].includes(browserLang)) {
      this.currentLanguage = browserLang;
    } else {
      this.currentLanguage = 'en';
    }

    this.lang.switch(this.currentLanguage as 'en' | 'pl' | 'it');
    localStorage.setItem('lang', this.currentLanguage);
  }

  switchLanguage(lang: 'en' | 'pl' | 'it') {
    this.currentLanguage = lang;
    this.lang.switch(lang);
    localStorage.setItem('lang', lang);
    this.isLanguageMenuOpen = false;
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
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
      })
      .catch(err => console.error('Share failed:', err));
    } else {
      alert('Sharing is not supported on this device');
    }
  }
  isLanguageHovered = false;

  onLangEnter() {
    this.isLanguageHovered = true;
  }

  onLangLeave() {
    this.isLanguageHovered = false;
  }

}
