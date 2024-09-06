import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, Subject } from 'rxjs';
import { LocalStorageData, LocalStorageKeysVersion, storageInitialData } from './storage-local.model';

/**
 * user current version to completely remove old data and start fresh for specific version
 */
@Injectable({
  providedIn: 'root',
})
export class StorageLocalService {
  private readonly STORAGE_MAIN_KEY = 'MARKET_MONITOR';

  private updateData$ = new Subject<LocalStorageData>();

  /**
   * current version of the data saved - if changed, all data will be removed
   */
  private currentVersion = 1.1;

  /** readonly value from local storage */
  readonly localData = toSignal(this.updateData$.pipe(startWith(this.getDataFromLocalStorage())), {
    initialValue: this.getDataFromLocalStorage(),
  });

  saveData<T extends keyof LocalStorageData>(key: T, data: LocalStorageData[T]): void {
    // all local storage data saved for this app - different keys
    const savedData = this.getDataFromLocalStorage();

    // updated data for this specific key
    const newData = {
      ...savedData,
      [key]: {
        ...data,
      } as LocalStorageData[T],
    };

    try {
      // can happen that too many data is saved
      localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(newData));

      // notify all subscribers
      this.updateData$.next(newData);
    } catch (e) {
      console.log(e);
    }
  }

  getData<T extends keyof LocalStorageData>(key: T): LocalStorageData[T] | undefined {
    const data = this.getDataFromLocalStorage();
    return data[key];
  }

  removeDataStorage<T extends keyof LocalStorageData>(key: T): void {
    // all local storage data saved for this app
    const data = this.getDataFromLocalStorage();

    // cleared data
    const newData = {
      ...data,
      [key]: null,
    };

    // merge old and new data
    localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(newData));
  }

  private getDataFromLocalStorage(): LocalStorageData {
    const data = localStorage.getItem(this.STORAGE_MAIN_KEY) ?? JSON.stringify(storageInitialData);
    const dataParsed = JSON.parse(data) as LocalStorageKeysVersion;

    // if version is different, clear all data
    if (dataParsed.version !== this.currentVersion) {
      localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(storageInitialData));
    }

    return dataParsed;
  }
}
