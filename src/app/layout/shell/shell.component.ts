import { Component, computed } from '@angular/core';
import { LayoutService } from '../../services/services';
import { NavbarDesktopComponent } from '../../components/navbar-desktop/navbarDesktop';
import { NavbarMobileComponent } from '../../components/navbar-mobile/navbarMobile';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarDesktopComponent, NavbarMobileComponent],
  templateUrl: './shell.component.html',
})
export class AppLayoutComponent {
  isMobile = computed(() => this.layout.isMobile());
  constructor(private layout: LayoutService) {}
}
