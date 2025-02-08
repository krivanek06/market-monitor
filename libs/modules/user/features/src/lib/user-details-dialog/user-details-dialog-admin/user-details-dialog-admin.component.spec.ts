import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsDialogAdminComponent } from './user-details-dialog-admin.component';

describe('UserDetailsDialogAdminComponent', () => {
  let component: UserDetailsDialogAdminComponent;
  let fixture: ComponentFixture<UserDetailsDialogAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsDialogAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsDialogAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
