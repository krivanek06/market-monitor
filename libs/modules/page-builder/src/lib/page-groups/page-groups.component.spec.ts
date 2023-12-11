import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageGroupsComponent } from './page-groups.component';

describe('PageGroupsComponent', () => {
  let component: PageGroupsComponent;
  let fixture: ComponentFixture<PageGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
