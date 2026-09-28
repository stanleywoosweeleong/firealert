# FireWatch PWA — patched release

Build: 2026-09-28-security-1. Publish the static files in this directory together.
Keep the configured bot username, Worker URL and coordinator contacts correct.

Registration now requires an operator-issued access code and a coordinated
Worker/webhook update. See DEPLOYMENT.md in the patch package before publishing.
The Alerts screen has Sync & check status and Update access code controls.
Registration status does not prove that the background monitoring job is healthy.

The app queries four satellite products, displays partial/unavailable coverage,
and excludes stale weather from risk calculations. It refreshes visible monitoring
after 15 minutes and on returning focus. No recent detections is not an all-clear.
