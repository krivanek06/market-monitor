import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDisplayInfoComponent } from './group-display-info.component';

describe('GroupDisplayInfoComponent', () => {
  let component: GroupDisplayInfoComponent;
  let fixture: ComponentFixture<GroupDisplayInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDisplayInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDisplayInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
