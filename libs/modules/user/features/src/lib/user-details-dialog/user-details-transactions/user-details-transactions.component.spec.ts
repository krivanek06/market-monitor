import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsTransactionsComponent } from './user-details-transactions.component';

describe('UserDetailsTransactionsComponent', () => {
  let component: UserDetailsTransactionsComponent;
  let fixture: ComponentFixture<UserDetailsTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsTransactionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
