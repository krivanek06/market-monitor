import { inject } from '@angular/core';
import { PlatformService } from '../platform/platform.service';

type SaveData<T> = {
  data: T | null;
  version: number;
};

/**
 * user current version to completely remove old data and start fresh for specific version
 */
export abstract class StorageLocalStoreService<T> {
  private readonly STORAGE_MAIN_KEY = 'MARKET_MONITOR';
  private storageKey: string;
  private defaultValues: T;

  /**
   * current version of the data saved - if changed, all data will be removed
   */
  private currentVersion = 1;

  platform = inject(PlatformService);

  constructor(key: string, defaultValues: T, currentVersion: number) {
    this.storageKey = key;
    this.defaultValues = defaultValues;
    this.currentVersion = currentVersion;

    this.checkSavedDataVersion();
  }

  updateDataStorage(data: T): void {
    if (this.platform.isServer) {
      return;
    }

    // all local storage data saved for this app - different keys
    const savedData = this.getDataFromLocalStorage();

    // updated data for this specific key
    const newData = {
      [this.storageKey]: {
        version: this.currentVersion,
        data,
      } satisfies SaveData<T>,
    };

    // combine all data and save
    const mergedData = JSON.stringify({ ...savedData, ...newData });

    try {
      // can happen that too many data is saved
      localStorage.setItem(this.STORAGE_MAIN_KEY, mergedData);
    } catch (e) {
      console.log(e);
    }
  }

  getDataStorage(): T {
    const data = this.getDataFromLocalStorage();
    return data[this.storageKey].data ?? this.defaultValues;
  }

  removeDataStorage(): void {
    if (this.platform.isServer) {
      return;
    }

    // all local storage data saved for this app
    const data = this.getDataFromLocalStorage();

    // cleared data
    const newData = {
      ...data,
      [this.storageKey]: {
        version: this.currentVersion,
        data: null,
      } satisfies SaveData<T>,
    };

    // merge old and new data
    localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(newData));
  }

  clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_MAIN_KEY);
  }

  private getDataFromLocalStorage(): {
    [key: string]: SaveData<T>;
  } {
    if (this.platform.isServer) {
      return {};
    }

    const data = localStorage.getItem(this.STORAGE_MAIN_KEY) ?? '{}';
    return JSON.parse(data);
  }

  /**
   * check if data version is the same as the current version.
   * Clears all data if the version is different or not found
   */
  private checkSavedDataVersion(): void {
    const data = this.getDataFromLocalStorage();
    const savedData = data[this.storageKey];

    console.log('checkSavedDataVersion');

    if (!savedData || !savedData.version || savedData.version !== this.currentVersion) {
      console.log('checkSavedDataVersion remove');
      this.removeDataStorage();
    }
  }
}
