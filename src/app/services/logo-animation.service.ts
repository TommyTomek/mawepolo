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

}
