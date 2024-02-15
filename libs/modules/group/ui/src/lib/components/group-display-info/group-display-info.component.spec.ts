import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupDisplayInfoComponent } from './group-display-info.component';

describe('GroupDisplayInfoComponent', () => {
  let component: GroupDisplayInfoComponent;
  let fixture: ComponentFixture<GroupDisplayInfoComponent>;

  beforeEach(async () => {
    MockBuilder(GroupDisplayInfoComponent);

    fixture = MockRender(GroupDisplayInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
