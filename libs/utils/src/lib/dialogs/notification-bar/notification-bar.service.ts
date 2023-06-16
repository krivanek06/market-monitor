import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationProgressService {
  private currentValue$: Subject<number> = new Subject();

  constructor() {}

  getCurrentValue(): Observable<number> {
    return this.currentValue$.asObservable();
  }

  setCurrentValue(value: number): void {
    this.currentValue$.next(value);
  }
}
