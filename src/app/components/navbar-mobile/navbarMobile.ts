import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/i18n/language.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule],
  templateUrl: './navbarMobile.html',
  styleUrls: ['./navbarMobile.scss']
})
export class NavbarMobileComponent {

  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';
  isLanguageHovered = false;

  constructor(private lang: LanguageService, 
              private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  // Delay until after hydration finishes
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
