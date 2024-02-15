import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageGroupDetailsComponent } from './page-group-details.component';

describe('PageGroupDetailsComponent', () => {
  let component: PageGroupDetailsComponent;
  let fixture: ComponentFixture<PageGroupDetailsComponent>;

  beforeEach(async () => {
    MockBuilder(PageGroupDetailsComponent);

    fixture = MockRender(PageGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
