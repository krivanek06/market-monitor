import { Injectable } from '@angular/core';
import { User } from '@market-monitor/api-types';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { mockUser } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticatedService {
  private authenticatedUser = new BehaviorSubject<User | null>(mockUser);
  constructor() {}

  get user(): User {
    const user = this.authenticatedUser.getValue();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user;
  }

  setUser(user: User): void {
    this.authenticatedUser.next(user);
  }

  getUser(): Observable<User> {
    return this.authenticatedUser.asObservable().pipe(filter((u): u is User => !!u));
  }
}
