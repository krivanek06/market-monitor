import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockOwnershipHoldersTableComponent } from './stock-ownership-holders-table.component';

describe('StockOwnershipHoldersTableComponent', () => {
  let component: StockOwnershipHoldersTableComponent;
  let fixture: ComponentFixture<StockOwnershipHoldersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOwnershipHoldersTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockOwnershipHoldersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
