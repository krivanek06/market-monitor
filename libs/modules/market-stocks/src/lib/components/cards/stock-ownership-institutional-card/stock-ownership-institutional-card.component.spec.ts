import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockOwnershipInstitutionalCardComponent } from './stock-ownership-institutional-card.component';

describe('StockOwnershipInstitutionalCardComponent', () => {
  let component: StockOwnershipInstitutionalCardComponent;
  let fixture: ComponentFixture<StockOwnershipInstitutionalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOwnershipInstitutionalCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockOwnershipInstitutionalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
