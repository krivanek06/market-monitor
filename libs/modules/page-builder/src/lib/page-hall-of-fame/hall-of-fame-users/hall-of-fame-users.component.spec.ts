import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HallOfFameUsersComponent } from './hall-of-fame-users.component';

describe('HallOfFameUsersComponent', () => {
  let component: HallOfFameUsersComponent;
  let fixture: ComponentFixture<HallOfFameUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallOfFameUsersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HallOfFameUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
