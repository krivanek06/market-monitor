import { Injectable } from '@angular/core';
import { UserApiService } from '@market-monitor/api-client';
import { UserData } from '@market-monitor/api-types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserFacadeService {
  constructor(private userApiService: UserApiService) {}

  getUsersByName(prefix: string): Observable<UserData[]> {
    return this.userApiService.getUsersByName(prefix);
  }
}
