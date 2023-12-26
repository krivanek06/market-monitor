import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadImageSingleControlComponent } from './upload-image-single-control.component';

describe('UploadImageSingleControlComponent', () => {
  let component: UploadImageSingleControlComponent;
  let fixture: ComponentFixture<UploadImageSingleControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadImageSingleControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadImageSingleControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
