import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockOwnershipInstitutionalListComponent } from './stock-ownership-institutional-list.component';

describe('StockOwnershipInstitutionalListComponent', () => {
  let component: StockOwnershipInstitutionalListComponent;
  let fixture: ComponentFixture<StockOwnershipInstitutionalListComponent>;

  beforeEach(async () => {
    MockBuilder(StockOwnershipInstitutionalListComponent);

    fixture = MockRender(StockOwnershipInstitutionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
