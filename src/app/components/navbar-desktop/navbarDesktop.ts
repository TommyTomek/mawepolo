import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Inject,HostListener,NgZone,PLATFORM_ID } from '@angular/core';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    UpperCasePipe,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './navbarDesktop.html',
  styleUrls: ['./navbarDesktop.scss']
})
export class NavbarDesktopComponent {

  currentLang: string;
  openMega: string | null = null;
  lastScroll = 0; 
  showSecondary = true; 
  scrollTimeout: any;
  isNavButtonHovered = false;


  constructor(
    private translate: TranslateService, 
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLang = this.translate.getCurrentLang() ?? 'en';;
    this.router.events.subscribe(() => { 
      this.openMega = null; 
    });
  }

  // Toggle between EN and IT
  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }
  // Toggle mega menu panels 
  toggleMega(panel: string) {
    this.openMega = this.openMega === panel ? null : panel;
  }
  closeMegaMenu() { 
    this.openMega = null; 
  }

  get shouldShrink(): boolean {
  return (
    !this.showSecondary &&
    this.openMega === null &&
    !this.isNavButtonHovered
  );
}


  @HostListener('window:scroll', [])
onWindowScroll() {
  if (!isPlatformBrowser(this.platformId)) return;

  const current = window.scrollY;

  // Only shrink when:
  // - scrolling down
  // - no mega menu is open
  // - nav-button is not hovered
  if (
    current > this.lastScroll &&
    current > 150 &&
    this.openMega === null &&
    !this.isNavButtonHovered
  ) {
    this.showSecondary = false;
  } else {
    this.showSecondary = true;
  }

  this.lastScroll = current;
}


}