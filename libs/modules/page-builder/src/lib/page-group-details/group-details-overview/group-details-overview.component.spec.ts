import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupDetailsOverviewComponent } from './group-details-overview.component';

describe('GroupDetailsOverviewComponent', () => {
  let component: GroupDetailsOverviewComponent;
  let fixture: ComponentFixture<GroupDetailsOverviewComponent>;

  beforeEach(() => {
    MockBuilder(GroupDetailsOverviewComponent);

    fixture = MockRender(GroupDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
