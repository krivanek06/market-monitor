import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderMainService {
  private loading = new BehaviorSubject<boolean>(false);

  constructor() {}

  getLoading() {
    return this.loading.asObservable();
  }

  setLoading(value: boolean) {
    this.loading.next(value);
  }
}
