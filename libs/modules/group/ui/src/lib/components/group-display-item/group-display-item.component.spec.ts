import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDisplayItemComponent } from './group-display-item.component';

describe('GroupDisplayItemComponent', () => {
  let component: GroupDisplayItemComponent;
  let fixture: ComponentFixture<GroupDisplayItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDisplayItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDisplayItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
