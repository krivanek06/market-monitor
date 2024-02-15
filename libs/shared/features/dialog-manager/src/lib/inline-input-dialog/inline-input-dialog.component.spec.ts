import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { InlineInputDialogComponent } from './inline-input-dialog.component';

describe('InlineInputDialogComponent', () => {
  let component: InlineInputDialogComponent;
  let fixture: ComponentFixture<InlineInputDialogComponent>;

  beforeEach(async () => {
    MockBuilder(InlineInputDialogComponent);

    fixture = MockRender(InlineInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
