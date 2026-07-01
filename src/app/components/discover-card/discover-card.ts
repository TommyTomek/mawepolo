import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-card.html',
  styleUrls: ['./discover-card.scss'],
  host: { class: 'dv-card' }
})
export class DiscoverCardComponent implements AfterViewInit, OnChanges {

  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() next?: string;

  @Input() region!: string;
  @Input() category?: string;
  @Input() slug?: string;

  @Input() animateOnClick: boolean = false;

  @Output() navigate = new EventEmitter();

  @ViewChild('imageEl', { static: false })
  imageEl!: ElementRef<HTMLElement>;

  loaded = false;
  animating = false;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.cdr.markForCheck();   // ← REQUIRED FOR ONPUSH
  }

  ngAfterViewInit() {
    const img = this.imageEl.nativeElement;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.loaded = true;
        this.cdr.markForCheck();   // ← REQUIRED FOR ONPUSH
        observer.disconnect();
      }
    });

    observer.observe(img);
  }

  get imageElement(): HTMLElement {
    return this.imageEl.nativeElement;
  }

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
