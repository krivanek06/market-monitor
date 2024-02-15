import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupCreateDialogComponent } from './group-create-dialog.component';

describe('GroupCreateDialogComponent', () => {
  let component: GroupCreateDialogComponent;
  let fixture: ComponentFixture<GroupCreateDialogComponent>;

  beforeEach(async () => {
    MockBuilder(GroupCreateDialogComponent);

    fixture = MockRender(GroupCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
