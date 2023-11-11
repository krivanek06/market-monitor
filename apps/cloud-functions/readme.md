## Generated Application Files

- `src/main.ts` - Default Firebase Functions entry point

## Generated Workspace Root Files

- `firebase.json` - Firebase CLI Configuration for this project
- `.firebaserc` - Default Firebase CLI Deployment Targets Configuration
- `firebase.json` - Intentionally Empty Firebase CLI Configuration (only needed to allow Firebase CLI to run in your workspace)

## Bug Fixes

When starting up the project an error was showed: `Error: Dynamic require of "fs" is not supported`
Solution used from https://github.com/evanw/esbuild/issues/1921#issuecomment-1710527349
