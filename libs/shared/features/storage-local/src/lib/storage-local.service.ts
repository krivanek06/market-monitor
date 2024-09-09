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

  private readonly updateData$ = new Subject<LocalStorageData>();

  /**
   * current version of the data saved - if changed, all data will be removed
   */
  private readonly currentVersion = 1.3;

  /** readonly value from local storage */
  readonly localData = toSignal(this.updateData$.pipe(startWith(this.getDataFromLocalStorage())), {
    initialValue: this.getDataFromLocalStorage(),
  });

  /**
   * saves data also into local storage
   *
   * @param key - key to save data
   * @param data - data to be saved
   */
  saveDataLocal<T extends keyof LocalStorageData>(key: T, data: LocalStorageData[T]): void {
    try {
      const newData = this.saveAndReturnState(key, data);

      // can happen that too many data is saved
      localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(newData));
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * saves data into local internal variable
   * @param key
   * @param data
   */
  saveData<T extends keyof LocalStorageData>(key: T, data: LocalStorageData[T]): void {
    this.saveAndReturnState(key, data);
  }

  private saveAndReturnState<T extends keyof LocalStorageData>(key: T, data: LocalStorageData[T]): LocalStorageData {
    // all local storage data saved for this app - different keys
    const savedData = this.getDataFromLocalStorage();

    // updated data for this specific key
    const newData = {
      ...savedData,
      [key]: data,
    };

    // notify all subscribers
    this.updateData$.next(newData);

    return newData;
  }

  private getDataFromLocalStorage(): LocalStorageData {
    const data = localStorage.getItem(this.STORAGE_MAIN_KEY) ?? '{}';
    const dataParsed = JSON.parse(data) as LocalStorageKeysVersion;

    // if version matches, return data
    if (dataParsed.version === this.currentVersion) {
      return dataParsed;
    }

    // create new initial data since version is different
    const updatedData = {
      ...storageInitialData,
      version: this.currentVersion,
    };

    // update local storage
    localStorage.setItem(this.STORAGE_MAIN_KEY, JSON.stringify(updatedData));

    return updatedData;
  }
}
