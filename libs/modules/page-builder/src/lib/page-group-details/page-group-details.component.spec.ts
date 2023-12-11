import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageGroupDetailsComponent } from './page-group-details.component';

describe('PageGroupDetailsComponent', () => {
  let component: PageGroupDetailsComponent;
  let fixture: ComponentFixture<PageGroupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageGroupDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
