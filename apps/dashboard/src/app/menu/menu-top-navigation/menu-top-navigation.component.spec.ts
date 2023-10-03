import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTopNavigationComponent } from './menu-top-navigation.component';

describe('MenuTopNavigationComponent', () => {
  let component: MenuTopNavigationComponent;
  let fixture: ComponentFixture<MenuTopNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuTopNavigationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuTopNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
