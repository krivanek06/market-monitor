import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UploadImageSingleControlComponent } from './upload-image-single-control.component';

describe('UploadImageSingleControlComponent', () => {
  let component: UploadImageSingleControlComponent;
  let fixture: ComponentFixture<UploadImageSingleControlComponent>;

  beforeEach(async () => {
    MockBuilder(UploadImageSingleControlComponent);

    fixture = MockRender(UploadImageSingleControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
