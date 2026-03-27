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
export class NavbarMobileComponent {}
