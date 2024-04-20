import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsPortfolioComponent } from './user-details-portfolio.component';

describe('UserDetailsPortfolioComponent', () => {
  let component: UserDetailsPortfolioComponent;
  let fixture: ComponentFixture<UserDetailsPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsPortfolioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
