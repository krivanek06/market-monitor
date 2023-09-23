import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangeSliderComponent } from './date-range-slider.component';

describe('DateRangeSliderComponent', () => {
  let component: DateRangeSliderComponent;
  let fixture: ComponentFixture<DateRangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DateRangeSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateRangeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
