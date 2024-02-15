import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupDisplayCardComponent } from './group-display-card.component';

describe('GroupDisplayCardComponent', () => {
  let component: GroupDisplayCardComponent;
  let fixture: ComponentFixture<GroupDisplayCardComponent>;

  beforeEach(async () => {
    MockBuilder(GroupDisplayCardComponent);

    fixture = MockRender(GroupDisplayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
