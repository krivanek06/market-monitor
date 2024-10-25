import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutstandingOrderCardDataComponent } from './outstanding-order-card-data.component';

describe('OutstandingOrderCardDataComponent', () => {
  let component: OutstandingOrderCardDataComponent;
  let fixture: ComponentFixture<OutstandingOrderCardDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutstandingOrderCardDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OutstandingOrderCardDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
