import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuSideNavigationComponent } from './menu-side-navigation.component';

describe('MenuSideNavigationComponent', () => {
  let component: MenuSideNavigationComponent;
  let fixture: ComponentFixture<MenuSideNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuSideNavigationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSideNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
