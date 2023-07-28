import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketCustomComponent } from './page-market-custom.component';

describe('PageMarketCustomComponent', () => {
  let component: PageMarketCustomComponent;
  let fixture: ComponentFixture<PageMarketCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketCustomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
