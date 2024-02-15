import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { NotificationProgressComponent } from './notification-bar.component';

describe('NotificationProgressComponent', () => {
  let component: NotificationProgressComponent;
  let fixture: ComponentFixture<NotificationProgressComponent>;

  beforeEach(async () => {
    MockBuilder(NotificationProgressComponent);

    fixture = MockRender(NotificationProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
