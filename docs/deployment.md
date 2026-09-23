# Activating Vox web and administration

## What the code provides

One Next.js deployment serves `voxagent.in`, `app.voxagent.in`, and `admin.voxagent.in`. The consumer app and administration use clean paths on their subdomains; local development uses `/app` and `/admin`. Route handlers and server pages enforce permissions independently of host rewrites.

Consumer authentication has its own PostgreSQL database, Better Auth session
secret, Google client, SMTP delivery, and Core credentials. Follow
[`consumer-auth.md`](consumer-auth.md) before adding `app.voxagent.in` or
enabling new consumer sign-ins.

No credentials or superuser identity are inferred. Missing configuration denies access. Complete these steps with the owner-selected Google account before production use.

## 1. Deploy Core with Redis administration

Deploy the matching `vox-core` change containing `/v1/admin/redis`. Configure `VOX_ADMIN_TOKEN` in the backend's protected environment file with a new random credential. Keep it distinct from `VOX_AUTH_TOKEN`. Existing Compose `env_file` handling passes it to Core; no Redis port publication is necessary.

Core needs its existing `REDIS_URL`. Redis 7+ is required; the existing Redis 8 deployment meets this requirement. Restart Core after changing its environment.

Route only the exact admin endpoint to Core's loopback port 3001 through an HTTPS reverse proxy. For Nginx, place the following inside the appropriate existing HTTPS server block, preserving that server's current TLS configuration:

```nginx
location = /v1/admin/redis {
    limit_except GET PUT DELETE { deny all; }
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Host $host;
    proxy_connect_timeout 2s;
    proxy_read_timeout 7s;
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-store" always;
    access_log off;
}
```

The dedicated bearer token remains required by Core. Do not expose Redis or other Core routes. Disabling query-string access logging avoids recording searched keys; substitute an approved redacted log format if operational logging is required.

## 2. Configure Supabase Auth for administration

Enable Google under Supabase Auth → Providers. Use the same Supabase project as consumer auth. Add redirect URLs:

- Production: `https://admin.voxagent.in/auth/callback`
- Local: `http://localhost:3000/auth/callback`

Also allow those callback URLs in the Google Cloud OAuth client that Supabase uses.

Set in the web hosting environment:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPERUSER_EMAILS` to the intended Google email(s), comma-separated
- `VOX_ADMIN_ORIGIN=https://admin.voxagent.in`

Only allowlisted, verified Google accounts can open `/admin`. Missing configuration denies access.

## 3. Connect web to Core

Set `VOX_CORE_ADMIN_URL` to the HTTPS origin that routes the admin endpoint and `VOX_ADMIN_TOKEN` to the dedicated credential configured in Core. Do not put the ordinary backend service token here.

Web-to-Core redirects are rejected to prevent credential forwarding. HTTPS is mandatory for remote Core URLs; plain HTTP is accepted only on localhost/loopback for development.

## 4. Configure hosting and DNS

Import `vox-web` into Vercel or update its existing project:

- Framework: Next.js (replace the previous Vite setting).
- Build command: `npm run build`.
- Install command: `npm ci`.
- Remove the previous `dist` output-directory override and let the Next.js preset manage output.
- Add `voxagent.in`, `app.voxagent.in`, and `admin.voxagent.in` as domains on the same project.
- Apply the exact DNS records supplied by Vercel for this project and wait for domain/TLS verification. Do not guess DNS targets.
- Deploy with the environment variables above. Use separately registered callback URLs for previews if previews require sign-in.

The public sign-in link uses the canonical admin hostname in production. Local sign-in remains on localhost.

## 5. Verify the live boundaries

1. The public homepage renders at `voxagent.in`.
2. `admin.voxagent.in` shows the login screen when signed out.
3. A signed-out request to `/api/admin/redis` returns 401 with no-store headers.
4. An unauthorized Google account is denied; an approved, verified account can sign in.
5. Redis explorer returns real data or an explicit empty state. Search, pagination, preview, edit and confirmed deletion work with a disposable verification key.
6. Sign out and confirm data requests are denied again.
7. Check the backend admin endpoint independently: requests without the dedicated token return 401, and unsupported methods are rejected.

Local tests validate the application, signed session handling and Redis protocol separately. Only a live Google sign-in and a disposable real Redis mutation validate the full production chain.
