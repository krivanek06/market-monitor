import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorEditComponent } from './page-trading-simulator-edit.component';

describe('PageTradingSimulatorEditComponent', () => {
  let component: PageTradingSimulatorEditComponent;
  let fixture: ComponentFixture<PageTradingSimulatorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
