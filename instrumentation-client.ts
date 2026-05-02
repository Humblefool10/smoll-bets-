// browser-side Sentry init. runs before the app becomes interactive.
// Next 16 instrumentation-client convention.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // sample everything in alpha; turn down once volume grows.
    sampleRate: 1.0,
    // tracing off for now — adds bundle weight; enable later if perf issues
    tracesSampleRate: 0,
    // ship release tag from vercel git commit so each deploy is isolated
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
    // alpha tone: noisy known errors filtered so the dashboard stays useful
    ignoreErrors: [
      // browser quirk, not actionable
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // user closed tab mid-fetch
      "AbortError",
      "Non-Error promise rejection captured",
      // realtime reconnects are expected during network blips
      /WebSocket.*closed before/,
    ],
  });
}

// surface client-side router transitions to Sentry as breadcrumbs
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
