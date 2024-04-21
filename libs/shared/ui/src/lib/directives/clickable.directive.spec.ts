import { Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ClickableDirective } from './clickable.directive';

@Component({
  template: ` <div appClickable>directive</div> `,
  imports: [ClickableDirective],
  standalone: true,
})
class TestComponent {}

describe('ClickableDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    MockBuilder(TestComponent);

    fixture = MockRender(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
