import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-card.html',
  styleUrls: ['./discover-card.scss'],
  host: { class: 'dv-card' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverCardComponent {

  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() next?: string;

  @Input() region!: string;
  @Input() category?: string;
  @Input() slug?: string;

  @Input() animateOnClick = false;

  @Output() navigate = new EventEmitter<{
    region: string;
    category?: string;
    slug?: string;
    next?: string;
  }>();

  loaded = false;
  animating = false;

  // FIX: previously an IntersectionObserver (rooted at the page viewport,
  // not the carousel's scroll container) decided when to reveal the image —
  // any card starting off to the side of the horizontally-scrolling row was
  // correctly reported as "not intersecting" and never loaded until it was
  // scrolled into view. A plain <img loading="lazy"> lets the browser handle
  // lazy-loading itself, and browsers already start fetching an image
  // shortly before it enters view, so neighboring cards are ready by the
  // time you swipe/autoscroll to them instead of popping in blank.
  //
  // The (load) binding below runs inside Angular's zone, so OnPush change
  // detection fires on its own — no ChangeDetectorRef/markForCheck needed
  // (the previous ngOnChanges -> markForCheck() call was also redundant:
  // @Input changes already trigger OnPush change detection automatically).
  onImageLoad(): void {
    this.loaded = true;
  }

  onClick(): void {
    if (!this.animateOnClick) {
      this.emitNavigation();
      return;
    }

    this.animating = true;
    setTimeout(() => this.emitNavigation(), 350);
  }

  private emitNavigation(): void {
    this.navigate.emit({
      region: this.region,
      category: this.category,
      slug: this.slug,
      next: this.next
    });
  }
}