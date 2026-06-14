import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-card.html',
  styleUrls: ['./discover-card.scss'],
  host: { class: 'dv-card' }
})
export class DiscoverCardComponent implements AfterViewInit {

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
    slug?: string;
    next?: string;
  }>();

  animating = false;
  loaded = false;

  constructor(private el: ElementRef) {}

  // -----------------------------------------------------
  // LAZY LOAD IMAGE WHEN CARD ENTERS VIEWPORT
  // -----------------------------------------------------
  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loaded = true;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(this.el.nativeElement);
  }

  // -----------------------------------------------------
  // CLICK HANDLER
  // -----------------------------------------------------
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
