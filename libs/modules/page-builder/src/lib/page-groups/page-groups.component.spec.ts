import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageGroupsComponent } from './page-groups.component';

describe('PageGroupsComponent', () => {
  let component: PageGroupsComponent;
  let fixture: ComponentFixture<PageGroupsComponent>;

  beforeEach(async () => {
    MockBuilder(PageGroupsComponent);

    fixture = MockRender(PageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
