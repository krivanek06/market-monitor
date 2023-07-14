import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarningsItemsDialogComponent } from './earnings-items-dialog.component';

describe('EarningsItemsDialogComponent', () => {
  let component: EarningsItemsDialogComponent;
  let fixture: ComponentFixture<EarningsItemsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsItemsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EarningsItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
