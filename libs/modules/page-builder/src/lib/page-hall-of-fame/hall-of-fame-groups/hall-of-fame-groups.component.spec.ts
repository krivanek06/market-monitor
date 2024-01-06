import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HallOfFameGroupsComponent } from './hall-of-fame-groups.component';

describe('HallOfFameGroupsComponent', () => {
  let component: HallOfFameGroupsComponent;
  let fixture: ComponentFixture<HallOfFameGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallOfFameGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HallOfFameGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
