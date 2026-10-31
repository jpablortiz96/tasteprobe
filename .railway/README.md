# TasteProbe Railway infrastructure

This is the current official TypeScript IaC format. It owns only the tasteprobe service in the separate tasteprobe project. One replica, no sleep/overlap, /api/health liveness and npm run start:public. Code is uploaded by Railway CLI; GitHub pushes do not automatically redeploy the running session state.

The official railway SDK is a pinned development dependency; run npm ci. The application typecheck excludes infrastructure authoring; Railway config plan validates this file against the selected target. Private values remain on Railway via preserve(); never inline secrets or use --show-values/--include-variables.

On Windows, SDK 3.16.0 needs the actual native CLI executable for its version check:

~~~powershell
$railwayGlobalRoot = npm root -g
$env:_ = Join-Path $railwayGlobalRoot '@railway/cli/bin/railway.exe'
& $env:_ config plan
~~~

Review the target project/environment and every change before apply. Do not apply to an unrelated existing project; omitted resources can be removed by IaC. Never accept destructive changes. Keep private plan artifacts under ignored evidence/private.
