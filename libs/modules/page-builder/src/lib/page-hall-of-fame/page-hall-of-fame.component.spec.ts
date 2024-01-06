import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHallOfFameComponent } from './page-hall-of-fame.component';

describe('PageHallOfFameComponent', () => {
  let component: PageHallOfFameComponent;
  let fixture: ComponentFixture<PageHallOfFameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHallOfFameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHallOfFameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
