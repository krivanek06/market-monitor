import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupSearchControlComponent } from './group-search-control.component';

describe('GroupSearchControlComponent', () => {
  let component: GroupSearchControlComponent;
  let fixture: ComponentFixture<GroupSearchControlComponent>;

  beforeEach(async () => {
    MockBuilder(GroupSearchControlComponent);

    fixture = MockRender(GroupSearchControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
