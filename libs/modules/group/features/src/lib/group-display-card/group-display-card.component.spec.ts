import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDisplayCardComponent } from './group-display-card.component';

describe('GroupDisplayCardComponent', () => {
  let component: GroupDisplayCardComponent;
  let fixture: ComponentFixture<GroupDisplayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDisplayCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDisplayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
