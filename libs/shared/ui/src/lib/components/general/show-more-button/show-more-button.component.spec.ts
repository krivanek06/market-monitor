import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ShowMoreButtonComponent } from './show-more-button.component';

describe('ShowMoreButtonComponent', () => {
  let component: ShowMoreButtonComponent;
  let fixture: ComponentFixture<ShowMoreButtonComponent>;

  beforeEach(async () => {
    MockBuilder(ShowMoreButtonComponent);

    fixture = MockRender(ShowMoreButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
