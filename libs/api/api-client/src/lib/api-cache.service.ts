import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Optional } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable, of, retry, tap } from 'rxjs';

export abstract class ApiCacheService {
  private validityOneMinute = 1000 * 60;
  private cache = new Map<string, { data: any; validity: number }>();

  validity1Min = 1;
  validity2Min = 2;
  validity3Min = 3;
  validity5Min = 5;
  validity10Min = 10;
  validity30Min = 30;
  validity1Hour = 60;
  validity2Hour = 120;

  constructor(@Optional() private readonly httpClient: HttpClient) {
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

  getData<T>(url: string, validityDefault = this.validity1Min): Observable<T> {
    // data cached
    if (this.checkDataAndValidity(url)) {
      const data = this.cache.get(url) as { data: any; validity: number };
      return of(data.data);
    }

    // no data cached
    const validity = validityDefault * this.validityOneMinute;
    return this.get<T>(url).pipe(
      retry(3),
      tap((data) => {
        console.log('save to cache');
        this.cache.set(url, {
          data,
          validity: Date.now() + validity,
        });
      }),
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

  postData<T, D>(url: string, data?: D, validityDefault = this.validity1Min): Observable<T> {
    // create hash
    const key = `${url}${JSON.stringify(data)}`;

    // data cached
    if (this.checkDataAndValidity(key)) {
      const data = this.cache.get(key) as { data: any; validity: number };
      return of(data.data);
    }

    // calculate validity
    const validity = validityDefault * this.validityOneMinute;

    return this.httpClient.post<T>(url, JSON.stringify(data), { headers: this.headers }).pipe(
      retry(1),
      tap((data) => {
        this.cache.set(key, {
          data,
          validity: Date.now() + validity,
        });
      }),
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

  private checkDataAndValidity(url: string): boolean {
    const data = this.cache.get(url);
    if (!data) {
      return false;
    }
    return isBefore(Date.now(), data.validity);
  }

  // TODO create function that each minute will check if data is still valid
  // if not, remove from cache
  checkDataValidity() {
    // todo
  }
}
