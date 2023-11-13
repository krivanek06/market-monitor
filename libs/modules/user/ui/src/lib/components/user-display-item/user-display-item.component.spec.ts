import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDisplayItemComponent } from './user-display-item.component';

describe('UserDisplayItemComponent', () => {
  let component: UserDisplayItemComponent;
  let fixture: ComponentFixture<UserDisplayItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDisplayItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDisplayItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
