## Deployment

### Deploying SSR

- `yarn mm:build:ssr`
- `yarn mm:cloud-function:build`
- `firebase deploy --only hosting:market-monitor-prod,functions`

## Errors

### ECONNREFUSED ::1:59760

github issue: https://github.com/angular/universal/issues/1848
solution: change `attempts` in `node_modules`
