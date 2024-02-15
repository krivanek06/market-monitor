import { TestBed } from '@angular/core/testing';

import { Firestore } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { MockProvider } from 'ng-mocks';
import { MarketApiService } from '../market-api/market-api.service';
import { GroupApiService } from './group-api.service';

describe('GroupApiService', () => {
  let service: GroupApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(Firestore), MockProvider(Functions), MockProvider(MarketApiService)],
    });
    service = TestBed.inject(GroupApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
