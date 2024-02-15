import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { HallOfFameGroupsComponent } from './hall-of-fame-groups.component';

describe('HallOfFameGroupsComponent', () => {
  let component: HallOfFameGroupsComponent;
  let fixture: ComponentFixture<HallOfFameGroupsComponent>;

  beforeEach(async () => {
    MockBuilder(HallOfFameGroupsComponent);

    fixture = MockRender(HallOfFameGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
