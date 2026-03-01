# Deployment

## Server

- **Provider**: Hetzner VPS
- **IP**: `5.223.42.90`
- **SSH**: `ssh root@5.223.42.90`
- **Web server**: Nginx
- **SSL**: Let's Encrypt (auto-managed by Certbot)

## Domains & routing

| URL | Nginx root | Repo source |
|---|---|---|
| `nam.space` | `/var/www/nam-space/html/` | `nam-space/index.html` |
| `nam.space/casa-nam/` | `/var/www/casa-nam/html/` | `casa-nam/index.html` |
| `nam.space/casa-nam/pitch/` | `/var/www/casa-nam/html/pitch/` | `pitch/index.html` |
| `nam.space/manifesto/` | `/var/www/nam-space/html/manifesto/` | `nam-space/manifesto/index.html` |
| `casanam.com` | — (301 redirect) | Redirects to `nam.space/casa-nam` |
| `members.nam.space` | — (reverse proxy) | Proxied to `127.0.0.1:3000` (separate app) |

## How to deploy

1. Push changes to `main`:
   ```
   git add . && git commit -m "..." && git push
   ```

2. SSH into the server and run the deploy script:
   ```
   ssh root@5.223.42.90 "bash /var/www/casa-nam/deploy.sh"
   ```

Or as a one-liner after pushing:
```
ssh root@5.223.42.90 "bash /var/www/casa-nam/deploy.sh"
```

## What the deploy script does

Location: `/var/www/casa-nam/deploy.sh`

1. Pulls latest `main` from GitHub into `/var/www/casa-nam/repo/`
2. Copies files to the Casa NāM web root (`/var/www/casa-nam/html/`):
   - `casa-nam/index.html` — Casa NāM landing page
   - `assets/` — Casa NāM assets
   - `pitch/index.html` — pitch deck
   - `nam-space/` — NāM Space page (also under Casa NāM path)
3. Copies NāM Space files to the root domain web root (`/var/www/nam-space/html/`):
   - `nam-space/index.html` → root `index.html`
   - `nam-space/assets/` → `assets/`
   - Any subdirectories under `nam-space/` (if added later)

## Adding a new page

When adding a new directory/page to the site:

1. Create the files in the repo (e.g. `nam-space/new-page/index.html`)
2. Update the deploy script on the server to copy the new directory:
   ```
   ssh root@5.223.42.90 "nano /var/www/casa-nam/deploy.sh"
   ```
   Add lines for both locations if it's a NāM Space subpage:
   ```bash
   # In the Casa NāM HTML_DIR section:
   mkdir -p "$HTML_DIR/nam-space/new-page"
   cp nam-space/new-page/index.html "$HTML_DIR/nam-space/new-page/"

   # In the nam.space NAM_DIR section:
   mkdir -p "$NAM_DIR/new-page"
   cp nam-space/new-page/index.html "$NAM_DIR/new-page/"
   ```
3. Push and deploy as normal

## Server directory structure

```
/var/www/
├── casa-nam/
│   ├── deploy.sh              ← production deploy script
│   ├── repo/                  ← git clone of this repo
│   └── html/                  ← served at nam.space/casa-nam/
│       ├── index.html
│       ├── assets/
│       ├── pitch/
│       └── nam-space/
├── nam-space/
│   └── html/                  ← served at nam.space (root)
│       ├── index.html
│       ├── assets/
│       └── manifesto/
├── nam-platform/              ← members.nam.space app (separate)
└── casa-nam-staging/
    └── html/                  ← staging at port 8080
```

## Staging

A staging server runs on port `8080` serving from `/var/www/casa-nam-staging/html/`.
Access via `http://5.223.42.90:8080`.

## Nginx config

Located at `/etc/nginx/sites-enabled/`. Key details:

- `nam.space` — static files from `/var/www/nam-space/html/`, with `/casa-nam/` aliased to `/var/www/casa-nam/html/`
- `casanam.com` — 301 redirect to `nam.space/casa-nam`
- `members.nam.space` — reverse proxy to port 3000 (the member directory app), with `/storage/` proxied to MinIO on port 9000
- `www.nam.space` — 301 redirect to `nam.space`
