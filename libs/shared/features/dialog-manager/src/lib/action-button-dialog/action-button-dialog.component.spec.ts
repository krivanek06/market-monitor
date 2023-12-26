import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButtonDialogComponent } from './action-button-dialog.component';

describe('ActionButtonDialogComponent', () => {
  let component: ActionButtonDialogComponent;
  let fixture: ComponentFixture<ActionButtonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButtonDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionButtonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
