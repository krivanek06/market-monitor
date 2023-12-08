import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupInvitationsManagerComponent } from './group-invitations-manager.component';

describe('GroupInvitationsManagerComponent', () => {
  let component: GroupInvitationsManagerComponent;
  let fixture: ComponentFixture<GroupInvitationsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupInvitationsManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupInvitationsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
