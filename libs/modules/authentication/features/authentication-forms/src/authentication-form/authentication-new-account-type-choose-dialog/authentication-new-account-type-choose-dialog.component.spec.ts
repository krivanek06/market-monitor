import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationNewAccountTypeChooseDialogComponent } from './authentication-new-account-type-choose-dialog.component';

describe('AuthenticationNewAccountTypeChooseDialogComponent', () => {
  let component: AuthenticationNewAccountTypeChooseDialogComponent;
  let fixture: ComponentFixture<AuthenticationNewAccountTypeChooseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationNewAccountTypeChooseDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticationNewAccountTypeChooseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
