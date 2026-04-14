import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbarMobile.html',
  styleUrls: ['./navbarMobile.scss']
})
export class NavbarMobileComponent {
  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en'; // Default language

  switchLanguage(lang: string) {
    // Implement language switching logic here
    console.log('Switching language to:', lang);
    this.currentLanguage = lang; // Update current language state
    localStorage.setItem('language', lang); // Persist language choice
    this.isLanguageMenuOpen = false; // Close menu after selection
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
  ngOnInit() {
  const saved = localStorage.getItem('lang');

  if (saved) {
    this.currentLanguage = saved;
    return;
  }

  const browserLang = navigator.language.split('-')[0];

  if (['en', 'it', 'pl'].includes(browserLang)) {
    this.currentLanguage = browserLang;
  } else {
    this.currentLanguage = 'en';
  }

  localStorage.setItem('lang', this.currentLanguage);
  }

}
