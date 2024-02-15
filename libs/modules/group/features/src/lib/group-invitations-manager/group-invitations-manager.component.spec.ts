import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupInvitationsManagerComponent } from './group-invitations-manager.component';

describe('GroupInvitationsManagerComponent', () => {
  let component: GroupInvitationsManagerComponent;
  let fixture: ComponentFixture<GroupInvitationsManagerComponent>;

  beforeEach(async () => {
    MockBuilder(GroupInvitationsManagerComponent);

    fixture = MockRender(GroupInvitationsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
