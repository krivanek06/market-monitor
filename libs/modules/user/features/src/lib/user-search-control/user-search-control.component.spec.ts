import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSearchControlComponent } from './user-search-control.component';

describe('UserSearchControlComponent', () => {
  let component: UserSearchControlComponent;
  let fixture: ComponentFixture<UserSearchControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearchControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearchControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
