import { Component, computed } from '@angular/core';
import { LayoutService } from '../../services/services';
import { NavbarMobileComponent } from '../../components/navbar-mobile/navbarMobile';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarMobileComponent],
  templateUrl: './shell.component.html',
})
export class AppLayoutComponent {
  isMobile;
  ready;

  constructor(private layout: LayoutService) {
    // Now layout is initialized, so computed() is safe
    this.isMobile = computed(() => this.layout.isMobile());
    this.ready = this.layout.ready;
  }
}
