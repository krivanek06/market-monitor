import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockOwnershipInstitutionalListComponent } from './stock-ownership-institutional-list.component';

describe('StockOwnershipInstitutionalListComponent', () => {
  let component: StockOwnershipInstitutionalListComponent;
  let fixture: ComponentFixture<StockOwnershipInstitutionalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOwnershipInstitutionalListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockOwnershipInstitutionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
