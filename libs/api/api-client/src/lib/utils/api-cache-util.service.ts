import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, retry, tap } from 'rxjs';

type SavedData<T = unknown> = { data: T; validity: number };

@Injectable({
  providedIn: 'root',
})
export class ApiCacheService {
  private validityOneMinute = 1000 * 60;
  private cache = new Map<string, { data: any; validity: number }>();

  static readonly validity1Min = 1;
  static readonly validity2Min = 2;
  static readonly validity3Min = 3;
  static readonly validity5Min = 5;
  static readonly validity10Min = 10;
  static readonly validity30Min = 30;
  static readonly validity1Hour = 60;
  static readonly validity2Hour = 120;

  httpClient = inject(HttpClient);

  constructor() {
    if (!this.httpClient) {
      throw new Error('HttpClient is required');
    }
  }

  get headers(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json',
    };

    return new HttpHeaders(headersConfig);
  }

  getData<T>(url: string, validityDefault = ApiCacheService.validity1Min): Observable<T> {
    // data cached
    const cachedData = this.getDataFromCache<T>(url);
    if (cachedData) {
      return of(cachedData.data);
    }

    // no data cached
    return this.get<T>(url).pipe(
      retry(1),
      tap((data) => this.saveDataIntoCache(url, data, validityDefault)),
    );
  }

  get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(`${url}`, {
      headers: this.headers,
    });
  }

  post<T, D>(url: string, data?: D): Observable<T> {
    return this.httpClient.post<T>(`${url}`, JSON.stringify(data), { headers: this.headers });
  }

  postData<T, D>(url: string, data?: D, validityDefault = ApiCacheService.validity1Min): Observable<T> {
    // create hash
    const key = `${url}${JSON.stringify(data)}`;

    // data cached
    const dataInCache = this.getDataFromCache<T>(key);
    if (dataInCache) {
      return of(dataInCache.data);
    }

    return this.httpClient.post<T>(url, JSON.stringify(data), { headers: this.headers }).pipe(
      retry(1),
      tap((data) => this.saveDataIntoCache(key, data, validityDefault)),
    );
  }

  put<T, D>(url: string, data: D): Observable<T> {
    return this.httpClient.put<T>(`${url}`, JSON.stringify(data), {
      headers: this.headers,
    });
  }

  delete<T>(url: string): Observable<T> {
    return this.httpClient.delete<T>(`${url}`, {
      headers: this.headers,
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * saves data into cache and local storage
   *
   * @param url - url user tries to access
   * @param data
   * @param validityDefault
   */
  private saveDataIntoCache<T>(url: string, data: T, validityDefault: number): void {
    // validity in milliseconds
    const validity = validityDefault * this.validityOneMinute;

    const savingData = {
      data,
      validity: Date.now() + validity,
    } satisfies SavedData<T>;

    // save data into cache
    this.cache.set(url, savingData);

    // log
    console.log('ApiCacheService: save', { [url]: savingData });
  }

  /**
   * checks if data is in cache or local storage
   *
   * @param url
   * @returns saved data in cache or local storage if exists
   */
  private getDataFromCache<T>(url: string): SavedData<T> | undefined {
    const data = this.cache.get(url) as { data: T; validity: number } | undefined;
    // check if no data in cache
    if (!data) {
      return undefined;
    }

    // check if data is valid
    if (data.validity < Date.now()) {
      console.log('ApiCacheService: get', { [url]: 'expired' });
      this.cache.delete(url);
      return undefined;
    }

    // data is valid
    return data;
  }
}
