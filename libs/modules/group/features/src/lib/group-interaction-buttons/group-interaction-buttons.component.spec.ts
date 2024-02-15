import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupInteractionButtonsComponent } from './group-interaction-buttons.component';

describe('GroupInteractionButtonsComponent', () => {
  let component: GroupInteractionButtonsComponent;
  let fixture: ComponentFixture<GroupInteractionButtonsComponent>;

  beforeEach(async () => {
    MockBuilder(GroupInteractionButtonsComponent);

    fixture = MockRender(GroupInteractionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
