import { Request, Response } from 'express';
import * as fs from 'fs';

import { ApplicationRef, StaticProvider } from '@angular/core';
import { CommonEngine } from '@nguniversal/common/engine';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { MemoryCache, caching } from 'cache-manager';
/**
 * RESOURCE: https://santibarbat.medium.com/4238-faster-pages-how-to-cache-angular-universal-routes-217c86c1b673
 */

/**
 * These are the values to cache a route
 *
 * path: The path without query params
 * useQueryParams: If true the catch key will contain the query params as well
 *  default: false
 * ttl: Time to live in cache
 *  default: 60 seconds
 * isCacheableValue: See if the request should be cached
 */
export interface RouteCache {
  path: string;
  useQueryParams?: boolean;
  ttl?: number;

  isCacheableValue?(path: any, req: Request): boolean;
}

/**
 * These are the allowed options for the engine
 */
export interface NgSetupOptions {
  bootstrap: () => Promise<ApplicationRef>;
  providers?: StaticProvider[];
  routeCaches?: RouteCache[];
}

/**
 * These are the allowed options for the render
 */
export interface RenderOptions extends NgSetupOptions {
  req: Request;
  res?: Response;
  url?: string;
  document?: string;
}

/**
 * This holds a cached version of each index used.
 */
const templateCache: { [key: string]: string } = {};

/**
 * This is an express engine for handling Angular Applications
 */
let memoryCache: MemoryCache;

const initMemoryCache = async () => {
  if (memoryCache) return;

  memoryCache = await caching('memory', {
    max: 100,
    ttl: 120 * 1000 /*milliseconds*/,
  });
};

export function ngFlavrHubExpressEngine(setupOptions: Readonly<NgSetupOptions>) {
  const engine = new CommonEngine(setupOptions.bootstrap, setupOptions.providers);

  return async function (filePath: string, options: object, callback: (err?: Error | null, html?: string) => void) {
    await initMemoryCache();
    try {
      const renderOptions = { ...options } as RenderOptions;
      if (!setupOptions.bootstrap && !renderOptions.bootstrap) {
        throw new Error('You must pass in a NgModule or NgModuleFactory to be bootstrapped');
      }

      const req = renderOptions.req;
      const res = renderOptions.res || req.res;

      renderOptions.url = renderOptions.url || `${req.protocol}://${req.get('host') || ''}${req.originalUrl}`;
      renderOptions.document = renderOptions.document || getDocument(filePath);

      renderOptions.providers = renderOptions.providers || [];
      renderOptions.providers = renderOptions.providers.concat(getReqResProviders(req, res));

      let routeCache: RouteCache | undefined;
      try {
        routeCache = setupOptions.routeCaches?.filter((route) => route.path === req.path)[0];
      } catch (e) {}

      if (routeCache) {
        const cacheKey = routeCache.useQueryParams ? req.originalUrl : req.path;

        memoryCache
          .get(cacheKey)
          .then((cached: any) => {
            if (cached) {
              callback(null, cached);
            } else {
              engine
                .render(renderOptions)
                .then((html) => {
                  if (!routeCache!.isCacheableValue || routeCache!.isCacheableValue(req.originalUrl, req)) {
                    memoryCache
                      .set(cacheKey, html, routeCache!.ttl ?? 60)
                      .catch((err: any) => console.log('Could not cache the request', err));
                  }

                  callback(null, html);
                })
                .catch(callback);
            }
          })
          .catch(callback);
      } else {
        // Default behaviour
        engine
          .render(renderOptions)
          .then((html) => callback(null, html))
          .catch(callback);
      }
    } catch (err) {
      callback(err as any);
    }
  };
}

/**
 * Get providers of the request and response
 */
function getReqResProviders(req: Request, res?: Response): StaticProvider[] {
  const providers: StaticProvider[] = [
    {
      provide: REQUEST,
      useValue: req,
    },
  ];
  if (res) {
    providers.push({
      provide: RESPONSE,
      useValue: res,
    });
  }

  return providers;
}

/**
 * Get the document at the file path
 */
function getDocument(filePath: string): string {
  return (templateCache[filePath] = templateCache[filePath] || fs.readFileSync(filePath).toString());
}
