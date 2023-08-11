import { Injectable } from '@angular/core';
import { StorageService } from '@market-monitor/shared-services';
import { UserCommonCachesData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserCommonService extends StorageService<UserCommonCachesData> {
  constructor() {
    super('USER_COMMON_DATA', {
      news: [],
    });
  }
}
