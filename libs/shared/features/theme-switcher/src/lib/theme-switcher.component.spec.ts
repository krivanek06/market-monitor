import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService } from './theme.service';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;

  let themeServiceMock = {
    isDarkMode: () => false,
  } as ThemeService;

  beforeEach(async () => {
    MockBuilder(ThemeSwitcherComponent).mock(ThemeService, themeServiceMock);

    fixture = MockRender(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
