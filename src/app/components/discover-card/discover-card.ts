import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-card.html',
  styleUrls: ['./discover-card.scss'],
  host: { class: 'dv-card' }
})
export class DiscoverCardComponent {

  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() next?: string;


  @Input() region!: string;
  @Input() category?: string;
  @Input() slug?: string;

  @Input() animateOnClick: boolean = false;

  @Output() navigate = new EventEmitter<{ 
    region: string; 
    category?: string; 
    slug?: string ;
    next?: string;
    
  }>();

  animating = false;

  onClick() {
    if (!this.animateOnClick) {
      this.emitNavigation();
      return;
    }

    this.animating = true;

    setTimeout(() => {
      this.emitNavigation();
    }, 350);
  }

  private emitNavigation() {
    this.navigate.emit({
      region: this.region,
      category: this.category,
      slug: this.slug,
      next: this.next
    });
  }
}
