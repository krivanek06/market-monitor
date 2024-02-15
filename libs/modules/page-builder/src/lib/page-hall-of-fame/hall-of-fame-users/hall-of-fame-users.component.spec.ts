import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { HallOfFameUsersComponent } from './hall-of-fame-users.component';

describe('HallOfFameUsersComponent', () => {
  let component: HallOfFameUsersComponent;
  let fixture: ComponentFixture<HallOfFameUsersComponent>;

  beforeEach(async () => {
    MockBuilder(HallOfFameUsersComponent);

    fixture = MockRender(HallOfFameUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
