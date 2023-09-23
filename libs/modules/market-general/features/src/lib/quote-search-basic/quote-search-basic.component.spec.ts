import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteSearchBasicComponent } from './quote-search-basic.component';

describe('QuoteSearchBasicComponent', () => {
  let component: QuoteSearchBasicComponent;
  let fixture: ComponentFixture<QuoteSearchBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteSearchBasicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteSearchBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
