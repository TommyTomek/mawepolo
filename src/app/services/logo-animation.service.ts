import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogoAnimationService {
  private triggerSubject = new Subject<void>();
  trigger$ = this.triggerSubject.asObservable();

  trigger() {
    this.triggerSubject.next();
  }

  private reverseSubject = new Subject<void>();
  reverse$ = this.reverseSubject.asObservable();

  reverse() {
    this.reverseSubject.next();
  }

  // NEW: back button event
  private backButtonSubject = new Subject<void>();
  backButton$ = this.backButtonSubject.asObservable();

  showBackButton() {
    this.backButtonSubject.next();
  }

  private backTargetSubject = new Subject<string[]>();
backTarget$ = this.backTargetSubject.asObservable();

setBackTarget(route: string[]) {
  this.backTargetSubject.next(route);
}
private logoAlreadyHidden = false;

markLogoHidden() {
  this.logoAlreadyHidden = true;
}

shouldAnimateOnDetail(): boolean {
  return !this.logoAlreadyHidden;
}

private cameFromDetail = false;

markFromDetail() {
  this.cameFromDetail = true;
}

consumeFromDetail(): boolean {
  const val = this.cameFromDetail;
  this.cameFromDetail = false;
  return val;
}
private shouldReverseOnHome = false;

enableReverseOnHome() {
  this.shouldReverseOnHome = true;
}

consumeReverseOnHome(): boolean {
  const val = this.shouldReverseOnHome;
  this.shouldReverseOnHome = false;
  return val;
}


}
