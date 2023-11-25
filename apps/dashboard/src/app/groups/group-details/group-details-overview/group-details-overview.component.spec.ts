import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDetailsOverviewComponent } from './group-details-overview.component';

describe('GroupDetailsOverviewComponent', () => {
  let component: GroupDetailsOverviewComponent;
  let fixture: ComponentFixture<GroupDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDetailsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
