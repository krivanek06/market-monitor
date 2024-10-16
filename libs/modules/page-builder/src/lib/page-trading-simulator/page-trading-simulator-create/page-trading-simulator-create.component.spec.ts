import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorCreateComponent } from './page-trading-simulator-create.component';

describe('PageTradingSimulatorCreateComponent', () => {
  let component: PageTradingSimulatorCreateComponent;
  let fixture: ComponentFixture<PageTradingSimulatorCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
