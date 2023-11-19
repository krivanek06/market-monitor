import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupSearchControlComponent } from './group-search-control.component';

describe('GroupSearchControlComponent', () => {
  let component: GroupSearchControlComponent;
  let fixture: ComponentFixture<GroupSearchControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupSearchControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupSearchControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
