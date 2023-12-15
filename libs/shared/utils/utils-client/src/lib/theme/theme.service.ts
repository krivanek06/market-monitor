import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { StorageLocalStoreService } from '../storage/storage-local-store.service';

export type ThemeType = 'light' | 'dark';
@Injectable({
  providedIn: 'root',
})
export class ThemeService extends StorageLocalStoreService<ThemeType> {
  private readonly LIGHT_THEME = 'light-theme';

  constructor(@Inject(DOCUMENT) private document: Document) {
    super('STORAGE_THEME_PREFERENCE', 'light');
    this.initTheme();
  }

  isLightMode(): boolean {
    return this.getData() === 'light';
  }

  toggleTheme(): void {
    const currentTheme = this.getData();
    if (currentTheme === 'light') {
      this.saveData('dark');
      this.document.body.classList.remove(this.LIGHT_THEME);
    } else {
      this.saveData('light');
      this.document.body.classList.add(this.LIGHT_THEME);
    }
  }

  private initTheme(): void {
    const currentTheme = this.getData();
    if (currentTheme === 'light') {
      this.document.body.classList.add(this.LIGHT_THEME);
    }
  }
}
