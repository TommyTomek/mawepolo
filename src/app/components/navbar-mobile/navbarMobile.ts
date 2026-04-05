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

}
