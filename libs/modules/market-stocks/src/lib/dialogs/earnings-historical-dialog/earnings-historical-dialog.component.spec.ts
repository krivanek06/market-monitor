import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarningsHistoricalDialogComponent } from './earnings-historical-dialog.component';

describe('EarningsHistoricalDialogComponent', () => {
  let component: EarningsHistoricalDialogComponent;
  let fixture: ComponentFixture<EarningsHistoricalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsHistoricalDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EarningsHistoricalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
