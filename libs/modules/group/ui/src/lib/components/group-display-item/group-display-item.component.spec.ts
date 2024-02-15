import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupDisplayItemComponent } from './group-display-item.component';

describe('GroupDisplayItemComponent', () => {
  let component: GroupDisplayItemComponent;
  let fixture: ComponentFixture<GroupDisplayItemComponent>;

  beforeEach(async () => {
    MockBuilder(GroupDisplayItemComponent);

    fixture = MockRender(GroupDisplayItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
