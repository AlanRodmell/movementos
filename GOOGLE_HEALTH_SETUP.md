# Google Health write-only setup

Movement OS writes a completed workout session to Google Health only after its local history save succeeds. It never calls a Google Health read endpoint and requests only the activity-and-fitness write scope.

The Google Health API currently requires a **Web Server** OAuth client and a client secret for refresh-token exchange. A secret cannot be protected in this public GitHub Pages app, so `worker/google-health-broker.js` is the minimal secret-holding broker. It stores no database records: the browser keeps an opaque AES-GCM-encrypted token bundle in the same `localStorage` mechanism used by Movement OS. Access and refresh tokens remain encrypted and are only opened inside the worker.

## 1. Google Cloud registration

1. Create or select a Google Cloud project and enable **Google Health API**.
2. Configure the OAuth consent screen as **External**, add your Google account as a test user, and add exactly this restricted scope:
   - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.writeonly`
3. Create an OAuth client of type **Web application / Web Server**.
4. Add this authorized JavaScript origin:
   - `https://alanrodmell.github.io`
5. Add this exact authorized redirect URI:
   - `https://alanrodmell.github.io/movementos/oauth-callback.html`
6. Copy the client ID and client secret. Never commit the client secret.

Google currently caps unverified apps at 100 users. Wider production access requires Google OAuth verification and a third-party security review because Google Health scopes are restricted.

## 2. Deploy the broker

The included worker uses standard Web APIs and has no application dependency. The example below uses Cloudflare Workers, but the module can be adapted to another serverless runtime.

1. Copy `worker/wrangler.toml.example` to `worker/wrangler.toml` (the destination is gitignored).
2. Replace `GOOGLE_HEALTH_CLIENT_ID` in that local file.
3. Add the two secrets through your host's secret manager:
   - `GOOGLE_HEALTH_CLIENT_SECRET`: the Google OAuth client secret.
   - `TOKEN_ENCRYPTION_SECRET`: a new high-entropy random value used to encrypt browser-held token bundles.
4. Deploy the worker and note its HTTPS URL.

With Wrangler installed or invoked through `npx`, the secret/deploy commands are:

```sh
cd worker
npx wrangler secret put GOOGLE_HEALTH_CLIENT_SECRET
npx wrangler secret put TOKEN_ENCRYPTION_SECRET
npx wrangler deploy --config wrangler.toml
```

The broker permits only the configured site origins, accepts only the four mapped workout categories, proxies only the exercise `POST`, refreshes access tokens on demand, and exposes no health-data read route.

## 3. Configure the static app

Edit `src/integrations/googleHealthConfig.ts` and replace both clearly marked placeholders:

- `GOOGLE_HEALTH_CLIENT_ID`: the same public OAuth client ID.
- `GOOGLE_HEALTH_BROKER_URL`: the deployed worker URL, without a trailing slash.

Rebuild and deploy the site. The Profile screen will then enable **Connect Google Health**.

## Workout mapping

| Movement OS session | Google Health `exerciseType` |
| --- | --- |
| Strength or muscle | `STRENGTH_TRAINING` |
| Endurance | `CIRCUIT_TRAINING` |
| General training | `WORKOUT` |
| Recovery or mobility | `OTHER` |

Recovery can combine mobility and stretching, so there is no single exact Google category. It intentionally uses `OTHER` and retains the Movement OS plan name in `displayName` and `notes` rather than guessing. The existing session start, completion time, timezone offsets, and stored duration are sent unchanged in meaning. No calories, steps, heart rate, GPS, or other telemetry are inferred.

## Current Google documentation

- [Set up Google Cloud and OAuth](https://developers.google.com/health/setup)
- [Google Health scopes](https://developers.google.com/health/scopes)
- [Write workout sessions](https://developers.google.com/health/data-types/workouts)
- [Create a v4 data point](https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/create)
