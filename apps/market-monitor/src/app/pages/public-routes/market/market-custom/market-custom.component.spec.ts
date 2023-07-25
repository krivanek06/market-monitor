import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketCustomComponent } from './market-custom.component';

describe('MarketCustomComponent', () => {
  let component: MarketCustomComponent;
  let fixture: ComponentFixture<MarketCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketCustomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
