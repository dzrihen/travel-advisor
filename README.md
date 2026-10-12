# יועץ היעדים
אתר סטטי (ללא שרת וללא API), נתונים ב-localStorage + ייצוא/ייבוא JSON. הנתונים ב-`data.js` משוערים.
פריסה: GitHub Pages → Settings → Pages → Deploy from branch `main` / root.

## Tripadvisor live data (Cloudflare Worker)
- Worker: `worker/` (deployed as `travel-advisor-proxy` → https://travel-advisor-proxy.daniel-zrihen.workers.dev, KV `travel-advisor-cache`).
- Endpoints: `/health`, `/ta/search?q=&category=attractions&lang=iw`, `/gyg/search` (501 until `GYG_API_KEY`).
- Set key: `cd worker && npx wrangler secret put TA_API_KEY` (or Dashboard → Workers → travel-advisor-proxy → Settings → Variables and Secrets).
- Frontend config: `src/config.js` (`workerUrl`; empty = off, falls back to curated trips).
