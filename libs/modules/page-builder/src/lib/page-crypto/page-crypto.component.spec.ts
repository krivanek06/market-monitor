import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageCryptoComponent } from './page-crypto.component';

describe('PageCryptoComponent', () => {
  let component: PageCryptoComponent;
  let fixture: ComponentFixture<PageCryptoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageCryptoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
