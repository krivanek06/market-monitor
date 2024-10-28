import { TestBed } from '@angular/core/testing';

import { Firestore } from '@angular/fire/firestore';
import { MockProvider } from 'ng-mocks';
import { OutstandingOrderApiService } from './outstanding-order-api.service';

describe('OutstandingOrdersApiService', () => {
  let service: OutstandingOrderApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(Firestore)],
    });
    service = TestBed.inject(OutstandingOrderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
