import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineInputDialogComponent } from './inline-input-dialog.component';

describe('InlineInputDialogComponent', () => {
  let component: InlineInputDialogComponent;
  let fixture: ComponentFixture<InlineInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineInputDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
