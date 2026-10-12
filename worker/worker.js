// Travel Advisor proxy – Tripadvisor Content API v1 (+ GetYourGuide placeholder)
// Secrets: TA_API_KEY, GYG_API_KEY (optional). Binding: CACHE (KV).
const ALLOWED = [/^https:\/\/dzrihen\.github\.io$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];
const TTL = 60 * 60 * 24 * 30; // 30 days
const RL_MAX = 30, RL_WIN = 60_000; // per IP per minute (per isolate, best effort)
const hits = new Map();
const TA = "https://api.content.tripadvisor.com/api/v1";

function cors(origin) {
  const ok = origin && ALLOWED.some(r => r.test(origin));
  return ok ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" } : { "Vary": "Origin" };
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", ...h } });

function limited(ip) {
  const now = Date.now(); const a = (hits.get(ip) || []).filter(t => now - t < RL_WIN);
  a.push(now); hits.set(ip, a); if (hits.size > 5000) hits.clear(); return a.length > RL_MAX;
}

async function ta(path, params, env) {
  const u = new URL(TA + path); u.searchParams.set("key", env.TA_API_KEY);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { accept: "application/json", referer: "https://dzrihen.github.io/" } });
  if (!r.ok) throw Object.assign(new Error("tripadvisor " + r.status), { status: r.status });
  return r.json();
}

async function taSearch(q, category, lang, env) {
  const s = await ta("/location/search", { searchQuery: q, category, language: lang }, env);
  const locs = (s.data || []).slice(0, 8);
  const items = await Promise.all(locs.map(async l => {
    const [d, p] = await Promise.all([
      ta(`/location/${l.location_id}/details`, { language: lang, currency: "ILS" }, env).catch(() => ({})),
      ta(`/location/${l.location_id}/photos`, { language: lang, limit: 1 }, env).catch(() => ({})),
    ]);
    const ph = p.data?.[0]?.images;
    return {
      id: l.location_id, name: d.name || l.name,
      rating: d.rating ? +d.rating : null, num_reviews: d.num_reviews ? +d.num_reviews : 0,
      url: d.web_url || `https://www.tripadvisor.com/${l.location_id}`,
      photo: ph?.medium?.url || ph?.small?.url || ph?.large?.url || null,
      description: (d.description || "").slice(0, 400),
      category: d.category?.localized_name || d.category?.name || category,
      subcategories: (d.subcategory || []).map(x => x.localized_name || x.name),
      groups: (d.groups || []).flatMap(g => [g.localized_name || g.name, ...(g.categories || []).map(c => c.localized_name || c.name)]),
      city: l.address_obj?.city || null,
      ranking: d.ranking_data?.ranking_string || null,
    };
  }));
  return { source: "tripadvisor", query: q, category, lang, items, attribution: "Data © Tripadvisor" };
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); const origin = req.headers.get("Origin"); const h = cors(origin);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (req.method !== "GET") return json({ error: "method" }, 405, h);
    if (origin && !h["Access-Control-Allow-Origin"]) return json({ error: "origin not allowed" }, 403, h);
    if (url.pathname === "/" || url.pathname === "/health") return json({ ok: true, ta: !!env.TA_API_KEY, gyg: !!env.GYG_API_KEY }, 200, h);
    const ip = req.headers.get("CF-Connecting-IP") || "x";
    if (limited(ip)) return json({ error: "rate limited" }, 429, { ...h, "Retry-After": "60" });

    if (url.pathname === "/ta/search") {
      const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
      const category = ["attractions", "restaurants", "hotels", "geos"].includes(url.searchParams.get("category")) ? url.searchParams.get("category") : "attractions";
      const lang = /^[a-z]{2}(_[A-Z]{2})?$/.test(url.searchParams.get("lang") || "") ? url.searchParams.get("lang") : "iw";
      if (!q) return json({ error: "q required" }, 400, h);
      if (!env.TA_API_KEY) return json({ error: "TA_API_KEY not configured" }, 503, h);
      const key = `ta:${category}:${lang}:${q.toLowerCase()}`;
      const hit = env.CACHE && await env.CACHE.get(key, "json");
      if (hit) return json({ ...hit, cached: true }, 200, { ...h, "Cache-Control": "public, max-age=86400" });
      try {
        const out = await taSearch(q, category, lang, env);
        if (env.CACHE && out.items.length) ctx.waitUntil(env.CACHE.put(key, JSON.stringify(out), { expirationTtl: TTL }));
        return json({ ...out, cached: false }, 200, { ...h, "Cache-Control": "public, max-age=86400" });
      } catch (e) { return json({ error: String(e.message) }, e.status === 429 ? 429 : 502, h); }
    }

    if (url.pathname === "/gyg/search") {
      // Planned: GetYourGuide Partner API – GET https://api.getyourguide.com/1/tours?q=<city>&cnt_language=he&currency=ILS
      // header X-ACCESS-TOKEN: env.GYG_API_KEY ; normalize to {name,rating,num_reviews,url,photo,description,category,price}
      if (!env.GYG_API_KEY) return json({ error: "GetYourGuide not configured yet (GYG_API_KEY missing)" }, 501, h);
      return json({ error: "GetYourGuide integration not implemented yet" }, 501, h);
    }
    return json({ error: "not found" }, 404, h);
  },
};
