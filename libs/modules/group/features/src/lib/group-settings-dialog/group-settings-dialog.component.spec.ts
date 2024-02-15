import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupSettingsDialogComponent } from './group-settings-dialog.component';

describe('GroupSettingsDialogComponent', () => {
  let component: GroupSettingsDialogComponent;
  let fixture: ComponentFixture<GroupSettingsDialogComponent>;

  beforeEach(async () => {
    MockBuilder(GroupSettingsDialogComponent);

    fixture = MockRender(GroupSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
