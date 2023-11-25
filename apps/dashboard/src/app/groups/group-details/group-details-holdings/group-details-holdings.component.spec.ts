import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDetailsHoldingsComponent } from './group-details-holdings.component';

describe('GroupDetailsHoldingsComponent', () => {
  let component: GroupDetailsHoldingsComponent;
  let fixture: ComponentFixture<GroupDetailsHoldingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDetailsHoldingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailsHoldingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
