import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarningsItemComponent } from './earnings-item.component';

describe('EarningsItemComponent', () => {
  let component: EarningsItemComponent;
  let fixture: ComponentFixture<EarningsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EarningsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
