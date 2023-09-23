import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioChangeComponent } from './portfolio-change.component';

describe('PortfolioChangeComponent', () => {
  let component: PortfolioChangeComponent;
  let fixture: ComponentFixture<PortfolioChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
