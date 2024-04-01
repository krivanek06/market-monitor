import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly DARK_THEME = 'dark-theme';
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private document = inject(DOCUMENT);

  isDarkMode = computed(() => !!this.authenticationUserStoreService.state.getUserData().settings.isDarkMode);

  isDarkModeEffect = effect(() => {
    console.log('[ThemeService] is dark:', this.isDarkMode());
    if (this.isDarkMode()) {
      this.document.body.classList.add(this.DARK_THEME);
    } else {
      this.document.body.classList.remove(this.DARK_THEME);
    }
  });

  toggleTheme(): void {
    this.authenticationUserStoreService.changeUserSettings({
      isDarkMode: !this.isDarkMode(),
    });
  }
}
