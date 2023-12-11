import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingComponent } from './page-trading.component';

describe('PageTradingComponent', () => {
  let component: PageTradingComponent;
  let fixture: ComponentFixture<PageTradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
