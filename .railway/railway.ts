import { defineRailway, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("tasteprobe", {
    build: "npm ci --include=dev && npm run build",
    start: "npm run start:public",
    replicas: 1,
    healthcheck: "/api/health",
    healthcheckTimeout: 60,
    deploy: { sleepApplication: false, overlapSeconds: 0 },
    // Values stay private in Railway; future plans must retain them.
    env: {
      QLOO_API_KEY: preserve(),
      QLOO_BASE_URL: preserve(),
      TMDB_READ_ACCESS_TOKEN: preserve(),
      TASTEPROBE_DEPLOYMENT: preserve(),
      TASTEPROBE_PUBLIC_ORIGIN: preserve(),
      TASTEPROBE_SIGNING_SECRET: preserve(),
      UPSTASH_REDIS_REST_URL: preserve(),
      UPSTASH_REDIS_REST_TOKEN: preserve(),
      TASTEPROBE_QUOTA_NAMESPACE: preserve(),
      TASTEPROBE_QLOO_TOTAL_LIMIT: preserve(),
      TASTEPROBE_TMDB_TOTAL_LIMIT: preserve(),
      NODE_ENV: preserve(),
    },
  });

  return project("tasteprobe", {
    resources: [web],
  });
});
