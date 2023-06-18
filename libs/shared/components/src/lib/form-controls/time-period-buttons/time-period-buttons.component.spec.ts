import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePeriodButtonsComponent } from './time-period-buttons.component';

describe('TimePeriodButtonsComponent', () => {
  let component: TimePeriodButtonsComponent;
  let fixture: ComponentFixture<TimePeriodButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePeriodButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePeriodButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
