import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAccountTypeSelectDialogComponent } from './user-account-type-select-dialog.component';

describe('UserAccountTypeSelectDialogComponent', () => {
  let component: UserAccountTypeSelectDialogComponent;
  let fixture: ComponentFixture<UserAccountTypeSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccountTypeSelectDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccountTypeSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
