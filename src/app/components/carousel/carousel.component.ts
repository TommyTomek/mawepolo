import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { DiscoverCardComponent } from '../discover-card/discover-card';
import { RelatedItem } from '../../types/region-detail.model';

type LoopItem = RelatedItem & { _clone?: boolean; _key: string };

const AUTO_SCROLL_MS = 5000;
const RESUME_DELAY_MS = 3000;
const SETTLE_DEBOUNCE_MS = 150;
const TRANSITION_MS = 450;
const RESIZE_DEBOUNCE_MS = 150;

@Component({
  selector: 'app-related-carousel',
  standalone: true,
  imports: [CommonModule, DiscoverCardComponent],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedCarouselComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() title!: string;
  @Input() items: RelatedItem[] = [];
  @Input() regionSlug!: string;

  @Output() navigate = new EventEmitter<{
    region: string;
    category: string;
    slug: string;
  }>();

  @ViewChild('relatedRow') relatedRow!: ElementRef<HTMLElement>;

  loopedItems: LoopItem[] = [];

  private viewReady = false;
  private teardown: (() => void) | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      if (this.items && this.items.length) {
        // FIX: each clone group now gets a distinct prefix (a-/b-/c-) so
        // track keys are unique across the WHOLE list. Previously both
        // clone groups produced identical keys (e.g. "paris-clone" twice),
        // which is invalid for @for's `track` and let Angular reuse/misplace
        // DOM nodes — corrupting the index assumptions the carousel JS
        // relies on (querySelectorAll order, offsetLeft, etc).
        this.loopedItems = [
          ...this.items.map((i, idx) => ({ ...i, _clone: true, _key: `a-${idx}-${i.slug}` })),
          ...this.items.map((i, idx) => ({ ...i, _key: `b-${idx}-${i.slug}` })),
          ...this.items.map((i, idx) => ({ ...i, _clone: true, _key: `c-${idx}-${i.slug}` }))
        ];
      } else {
        this.loopedItems = [];
      }

      // FIX: previously only ngAfterViewInit ever called initCarousel(), and
      // it marked itself "initialized" even when cards.length was 0 (e.g.
      // items arrived asynchronously after view init — common when related
      // items come from an API call, and more likely to lose that race on
      // mobile networks). That left the carousel dead forever: no `active`
      // class ever got set, so every card matched the `:not(.active)` CSS
      // rule (dimmed + blurred) — which is exactly the "text not visible
      // until scroll" symptom. We now (re)schedule init any time the items
      // input actually changes, as long as the view is ready.
      this.scheduleInit();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleInit();
  }

  ngOnDestroy(): void {
    // FIX: previously nothing ever cleared the autoscroll interval or
    // removed listeners, so re-initializing (or destroying the component)
    // could leak timers/listeners bound to detached DOM.
    this.teardown?.();
    this.teardown = null;
  }

  onNavigate(item: RelatedItem) {
    this.navigate.emit({
      region: item.title,
      category: item.category,
      slug: item.slug
    });
  }

  /** (Re)binds the carousel to the current DOM once the view + cards are ready. */
  private scheduleInit(): void {
    if (!this.viewReady) return;

    this.teardown?.();
    this.teardown = null;

    // Two rAFs: one to let Angular finish painting the @for update, one to
    // let the browser settle layout before we read offsetLeft/getBoundingClientRect.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.teardown = this.initCarousel() ?? null;
      });
    });
  }

  /**
   * Wires up the carousel for the CURRENT set of `.related-card` elements.
   * Returns a cleanup function, or `undefined` if the cards aren't in the
   * DOM yet (e.g. items still empty) — in that case scheduleInit() will
   * simply be called again the next time `items` changes.
   */
  private initCarousel(): (() => void) | undefined {
    const row = this.relatedRow?.nativeElement ?? null;
    const cards = Array.from(row?.querySelectorAll<HTMLElement>('.related-card') ?? []);

    if (!row || cards.length === 0) return undefined;

    let loopLock = false;
    let autoScrolling = false;
    let destroyed = false;

    const total = cards.length;
    const loopSize = Math.floor(total / 3);
    const loopStart = loopSize;
    const loopEnd = loopSize * 2;
    let current = Math.max(loopStart, 0);

    row.classList.add('carousel-no-anim');

    const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
      current = Math.max(0, Math.min(total - 1, index));
      const card = cards[current];
      const left = card.offsetLeft - (row.clientWidth - card.clientWidth) / 2;
      row.scrollTo({ left, behavior });
    };

    const updateActiveCard = () => {
      cards.forEach((card, index) => {
        card.classList.toggle('active', index === current);
      });
    };

    /* ---------------------------------------------------
       Seamless infinite-loop teleport. Shared by autoscroll,
       arrow clicks, and manual-scroll settle so there's a
       single source of truth for the loop math.
    ----------------------------------------------------*/
    const resolveLoopPosition = (): boolean => {
      if (current > loopEnd - 1) {
        loopLock = true;
        row.classList.add('carousel-no-anim');
        current -= loopSize;
        scrollToCard(current, 'auto');
        updateActiveCard();
        requestAnimationFrame(() => {
          row.classList.remove('carousel-no-anim');
          loopLock = false;
        });
        return true;
      }

      if (current < loopStart) {
        loopLock = true;
        row.classList.add('carousel-no-anim');
        current += loopSize;
        scrollToCard(current, 'auto');
        updateActiveCard();
        requestAnimationFrame(() => {
          row.classList.remove('carousel-no-anim');
          loopLock = false;
        });
        return true;
      }

      return false;
    };

    // Initial center, no animation, then release the anim-lock next frame
    // so the *first* real scroll (autoscroll/arrow/swipe) can animate.
    scrollToCard(current, 'auto');
    updateActiveCard();
    requestAnimationFrame(() => row.classList.remove('carousel-no-anim'));

    /* ---------------------------------------------------
       AUTO-SCROLL
    ----------------------------------------------------*/
    const goToNextCard = () => {
      autoScrolling = true;
      const next = current + 1;
      scrollToCard(next);
      current = next;
      updateActiveCard();

      window.setTimeout(() => {
        autoScrolling = false;
        resolveLoopPosition();
      }, TRANSITION_MS);
    };

    let autoScrollTimer: number | undefined;
    const startAutoScroll = () => {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = window.setInterval(goToNextCard, AUTO_SCROLL_MS);
    };

    let resumeTimer: number | undefined;
    const pauseAutoScroll = () => {
      window.clearInterval(autoScrollTimer);
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(startAutoScroll, RESUME_DELAY_MS);
    };

    startAutoScroll();

    // FIX: `passive: true` on touch/wheel listeners avoids blocking the
    // browser's native scroll handling on mobile (previously non-passive
    // by default, which can add scroll-jank on touch devices).
    const onInteractionStart = () => pauseAutoScroll();
    row.addEventListener('touchstart', onInteractionStart, { passive: true });
    row.addEventListener('pointerdown', onInteractionStart, { passive: true });
    row.addEventListener('wheel', onInteractionStart, { passive: true });

    /* ---------------------------------------------------
       ARROWS
    ----------------------------------------------------*/
    const leftArrow = row.parentElement?.querySelector<HTMLElement>('.carousel-arrow.left') ?? null;
    const rightArrow = row.parentElement?.querySelector<HTMLElement>('.carousel-arrow.right') ?? null;

    const step = (direction: 1 | -1) => {
      pauseAutoScroll();
      autoScrolling = true;
      const next = current + direction;
      scrollToCard(next);
      current = next;
      updateActiveCard();

      window.setTimeout(() => {
        autoScrolling = false;
        resolveLoopPosition();
      }, TRANSITION_MS);
    };

    const onLeftClick = () => step(-1);
    const onRightClick = () => step(1);
    leftArrow?.addEventListener('click', onLeftClick);
    rightArrow?.addEventListener('click', onRightClick);

    /* ---------------------------------------------------
       MANUAL / TOUCH SCROLLING
       FIX: previously a custom ontouchstart/ontouchend handler
       called scrollToCard() on top of the browser's own native
       touch-scroll momentum on `row` — two competing scroll
       animations fighting each other, which is exactly the kind
       of thing that "works on desktop, breaks on phone." Native
       touch scrolling (+ scroll-snap in the SCSS) now handles
       swiping entirely; JS only figures out where it landed.
    ----------------------------------------------------*/
    const findClosestIndex = (): number => {
      const rowRect = row.getBoundingClientRect();
      const viewportCenter = rowRect.left + rowRect.width / 2;
      let closestIndex = current;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const onSettled = () => {
      if (autoScrolling || loopLock) return;
      current = findClosestIndex();
      updateActiveCard();
      resolveLoopPosition();
    };

    let settleTimer: number | undefined;
    const onScroll = () => {
      if (loopLock || autoScrolling) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(onSettled, SETTLE_DEBOUNCE_MS);
    };

    // FIX: a fixed 120ms "has scrolling stopped" debounce can fire mid
    // native momentum-scroll on iOS/Android (inertial scroll can pause
    // and resume within that window), causing the loop-teleport to run
    // too early — this was the main reason the infinite loop misbehaved
    // specifically on phones. `scrollend` fires only once the browser's
    // own scroll (including momentum) has actually finished, so we prefer
    // it where supported and keep the debounce purely as a fallback for
    // browsers that don't support `scrollend` yet.
    const supportsScrollEnd = 'onscrollend' in window;
    row.addEventListener('scroll', onScroll, { passive: true });
    if (supportsScrollEnd) {
      row.addEventListener('scrollend', onSettled, { passive: true });
    }

    /* ---------------------------------------------------
       RESIZE / ORIENTATION CHANGE
       FIX: previously nothing recalculated position after a
       resize, so rotating a phone (which changes each card's
       70%-of-row width) left the "active" card visibly off-center.
    ----------------------------------------------------*/
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        row.classList.add('carousel-no-anim');
        scrollToCard(current, 'auto');
        requestAnimationFrame(() => row.classList.remove('carousel-no-anim'));
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (destroyed) return;
      destroyed = true;

      window.clearInterval(autoScrollTimer);
      window.clearTimeout(resumeTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(resizeTimer);

      row.removeEventListener('touchstart', onInteractionStart);
      row.removeEventListener('pointerdown', onInteractionStart);
      row.removeEventListener('wheel', onInteractionStart);
      row.removeEventListener('scroll', onScroll);
      if (supportsScrollEnd) {
        row.removeEventListener('scrollend', onSettled);
      }
      window.removeEventListener('resize', onResize);

      leftArrow?.removeEventListener('click', onLeftClick);
      rightArrow?.removeEventListener('click', onRightClick);
    };
  }
}