import { Request, Response } from 'express';
export const corsMiddleWare =
  (handler: (req: Request, res: Response<any>) => any, { authenticatedRoute = false } = {}) =>
  (req: Request, res: Response<any>) => {
    if (authenticatedRoute) {
      // TODO: Implement authentication
      // const isAuthorized = isAuthenticated(req)
      // if (!isAuthorized) {
      //   return res.status(401).send('Unauthorized')
      // }
    }

    // todo change to prod URL
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '3600');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return handler(req, res);
  };
