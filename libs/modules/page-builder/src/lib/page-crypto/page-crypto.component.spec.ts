import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageCryptoComponent } from './page-crypto.component';

describe('PageCryptoComponent', () => {
  let component: PageCryptoComponent;
  let fixture: ComponentFixture<PageCryptoComponent>;

  beforeEach(async () => {
    MockBuilder(PageCryptoComponent);

    fixture = MockRender(PageCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
