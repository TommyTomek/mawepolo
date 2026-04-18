import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './discover-card.html',
  styleUrls: ['./discover-card.scss'],
  host: { class: 'dv-card' } // ensures compatibility with your CSS
})
export class DiscoverCardComponent {

  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() region!: string;
  @Input() category!: string;
  @Input() slug!: string;

}
