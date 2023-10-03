import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryActionButtonsComponent } from './summary-action-buttons.component';

describe('SummaryActionButtonsComponent', () => {
  let component: SummaryActionButtonsComponent;
  let fixture: ComponentFixture<SummaryActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SummaryActionButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
