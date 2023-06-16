import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryModalSkeletonComponent } from './summary-modal-skeleton.component';

describe('SummaryModalSkeletonComponent', () => {
  let component: SummaryModalSkeletonComponent;
  let fixture: ComponentFixture<SummaryModalSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryModalSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryModalSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
