# Deploying on Hostinger

Two supported layouts. **A** keeps everything on Hostinger; **B** is the layout used by
`loyverse-api-backend` (API on Render, database on Hostinger).

|   | API runs on | MySQL | When to pick |
|---|-------------|-------|--------------|
| **A** | Hostinger *Node.js web app* (Business / Cloud plans) | Hostinger | one provider, `MYSQL_HOST=localhost`, no remote-MySQL setup |
| **B** | Render (`render.yaml` included) | Hostinger via Remote MySQL | plan has no Node.js support |

## 1. MySQL database (both layouts)

1. hPanel → **Websites → your site → Databases → MySQL Databases**
2. Create a database (e.g. `u123456_ic2`) and a user with **All Privileges**
3. Note: host (`localhost` for layout A; the remote hostname shown in hPanel for layout B), user, password, database name
4. Layout B only: **Databases → Remote MySQL** → add Render's outbound IPs (Render dashboard → your service → *Outbound IPs*) and your own IP for local dev
5. Tables are created automatically on first boot. To pre-create or inspect: hPanel → phpMyAdmin → SQL tab → paste `src/db/schema.sql`

## 2A. API as a Hostinger Node.js web app on a subdomain (zip upload / File Manager)

Target layout: frontend on `https://yourdomain.com` (static files in `public_html`), API on
`https://api.yourdomain.com` (Node.js web app). No GitHub needed.

**Nothing in the code has to change for a subdomain** — it is all environment variables:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
COOKIE_SAME_SITE=lax        # api.yourdomain.com and yourdomain.com are the same site → Lax works and is the safer choice
COOKIE_SECURE=true
TRUST_PROXY=auto
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=u123456_ic2admin
MYSQL_PASSWORD=********
MYSQL_DATABASE=u123456_ic2
JWT_SECRET=<64+ random chars>
JWT_EXPIRES_IN=1d
```

(If the frontend ever lives on a *different* domain, drop `COOKIE_SAME_SITE` back to `auto`/`none`.)

### Steps

1. **Subdomain** — hPanel → your website → **Domains → Subdomains** → create `api` (→ `api.yourdomain.com`). Wait for it to show as active.
2. **Build the upload archive** on your PC:

   ```bash
   cd api-backend
   npm run pack:hostinger        # → deploy/ic2-tabulation-api.zip (source + fresh dist/, no node_modules/.env)
   ```

3. hPanel → **Websites → Add Website → Node.js web app → Upload your files** → choose the zip → pick the **`api.yourdomain.com`** subdomain as the website's domain.
4. Deploy settings Hostinger asks for:

   | Setting | Value |
   |---------|-------|
   | Framework preset | Node.js / Express (server app) |
   | Node.js version | 22 |
   | Build command | `npm run build` (Hostinger runs `npm install` first; the zip already contains `dist/` so this is just a safety rebuild) |
   | Entry file | `dist/index.js` |
   | Output directory | leave empty (server app) |

5. **Environment variables** step → *Import from .env* → paste the block above with real values. Hostinger stores them outside the code; they are **not** read from a `.env` file inside the zip (and never upload your real `.env`).
6. Deploy. Open `https://api.yourdomain.com/health` → expect `{ "ok": true, "mysql": "ok" }` (HTTP 200). `https://api.yourdomain.com/` shows a small JSON landing page.
7. **Updating later:** either upload a new zip through the same Node.js app dashboard (**Deployments → Upload**), or edit files in **File Manager** and click **Settings & Redeploy → Redeploy** — Hostinger re-runs `npm install` + the build command. Changing environment variables also needs a redeploy.

### Frontend on the main domain

```env
# ic2-tabulation-frontend/.env (production build)
VITE_API_URL=https://api.yourdomain.com/api
VITE_MOCK_API=false
```

`npm run build`, then upload the contents of `dist/` into `public_html` with File Manager and add the `.htaccess` from section 4 below.

## 2A-alt. Same thing via GitHub import

1. Push this folder to GitHub (its own repo, e.g. `ic2-tabulation-api`)
2. hPanel → **Websites → Add Website → Node.js web app → Import Git repository → Connect with GitHub**
3. Settings Hostinger asks for:

   | Setting | Value |
   |---------|-------|
   | Framework | Node.js / Express-style (no preset needed) |
   | Node version | 20 or 22 |
   | Build command | `npm run build` |
   | Start / entry file | `npm start` (entry `dist/index.js`) |
   | Port | Hostinger injects `PORT` — the app reads it |

4. **Environment variables** (hPanel → the Node.js app → Environment variables). Copy from `.env.example`:

   ```env
   NODE_ENV=production
   HOST=0.0.0.0
   CORS_ORIGIN=https://tabulation.example.com      # the frontend's exact origin, no trailing slash
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=u123456_ic2admin
   MYSQL_PASSWORD=********
   MYSQL_DATABASE=u123456_ic2
   JWT_SECRET=<64+ random chars>
   JWT_EXPIRES_IN=1d
   TRUST_PROXY=auto
   ```

   The app refuses to start with a placeholder `JWT_SECRET` or, in production, an empty `CORS_ORIGIN`.

   Generate a secret locally: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

5. Deploy, then open `https://<api-domain>/health` → expect `{ "ok": true, "mysql": "ok" }`
6. Create the first admin. Either run the seed once from your PC against the Hostinger DB (layout B style, Remote MySQL enabled for your IP):

   ```bash
   MYSQL_HOST=<remote-host> MYSQL_USER=... MYSQL_PASSWORD=... MYSQL_DATABASE=... npm run seed -- --admin=admin:StrongPassw0rd
   ```

   …or insert the row in phpMyAdmin with a bcrypt hash you generate locally:
   `node -e "require('bcryptjs').hash('StrongPassw0rd',12).then(console.log)"`

   Judges can then be created from the admin account via `POST /api/users`.

## 2B. API on Render, MySQL on Hostinger

1. Render → New → **Blueprint** → point at this repo (uses `render.yaml`), or New → Web Service with build `npm run build`, start `npm start`
2. Set the same environment variables as above, but `MYSQL_HOST` = the Hostinger remote host and `MYSQL_SSL=true` if Hostinger requires TLS for remote connections
3. Whitelist Render's outbound IPs in hPanel → Remote MySQL
4. Health check path: `/health`

## 3. Cookies across domains (read this if login "works" but the next request is 401)

The session is an httpOnly cookie. Browsers only send it back when the cookie attributes match the deployment:

| Frontend | API | Setting |
|----------|-----|---------|
| `https://tabulation.example.com` | `https://api.example.com` (same site, different subdomain) | defaults are fine (`NODE_ENV=production` → `Secure`, `SameSite=None`). Optionally `COOKIE_DOMAIN=.example.com` |
| `https://tabulation.example.com` | `https://ic2-api.onrender.com` (cross-site) | defaults are fine — `SameSite=None; Secure` is exactly for this. Both must be HTTPS |
| `http://localhost:5173` | `http://localhost:3001` | `NODE_ENV=development` → `SameSite=Lax`, not secure |

`CORS_ORIGIN` must contain the frontend origin **exactly** (scheme + host, no path, no trailing slash);
the API answers `Access-Control-Allow-Credentials: true` only for listed origins.

## 4. Frontend `.env` for production

```env
VITE_API_URL=https://api.example.com/api
VITE_MOCK_API=false
```

Build with `npm run build` and upload `dist/` to the Hostinger website (or deploy it as a static site). Because the Vue app uses history-mode routing, add a rewrite so deep links load `index.html`: hPanel file manager → `public_html/.htaccess`:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 5. Checklist

- [ ] `/health` returns `mysql: "ok"`
- [ ] `CORS_ORIGIN` = frontend origin, `VITE_API_URL` = API origin + `/api`
- [ ] `JWT_SECRET` is long and random; `.env` is not committed
- [ ] Admin account seeded; judges created from the dashboard/API
- [ ] Frontend `.htaccess` rewrite in place
