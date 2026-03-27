import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  isMobile = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateLayout();
      window.addEventListener('resize', () => this.updateLayout());
    }
  }

  private updateLayout() {
    this.isMobile.set(window.innerWidth < 768);
  }
}
