## Deployment

### Deploying SSR

- `yarn mm:build:ssr`
- `yarn mm:cloud-function:build`
- `firebase deploy --only hosting:market-monitor-prod,functions`

Docker Deployment

- `docker buildx build --platform linux/amd64  -t my-image:0.1`
- `docker run -p 4000:4000 -d my-image:0.1`
- `gcloud run deploy --image gcr.io/market-monitor-prod/my-image:0.1 --platform managed --max-instances=1 --region=europe-west3`

## Errors

### ECONNREFUSED ::1:59760

github issue: https://github.com/angular/universal/issues/1848
solution: change `attempts` in `node_modules`
