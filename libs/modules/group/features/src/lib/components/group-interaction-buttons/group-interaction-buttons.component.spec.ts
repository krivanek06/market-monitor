import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupInteractionButtonsComponent } from './group-interaction-buttons.component';

describe('GroupInteractionButtonsComponent', () => {
  let component: GroupInteractionButtonsComponent;
  let fixture: ComponentFixture<GroupInteractionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupInteractionButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupInteractionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
