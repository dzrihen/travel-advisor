from urllib.parse import unquote
from playwright.sync_api import sync_playwright
U="http://localhost:8765/";errs=[];reqs=[]
with sync_playwright() as p:
  b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
  for name,vp in [("desktop",{"width":1280,"height":900}),("mobile",{"width":390,"height":844})]:
    pg=b.new_page(viewport=vp);pg.on("console",lambda m:m.type=="error" and errs.append(m.text));pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("request",lambda r:reqs.append(r.url))
    pg.goto(U);pg.evaluate("localStorage.clear()");pg.reload()
    for k in ["trek","food"]:pg.click(f".lv[data-k={k}] button >> nth=3")
    pg.click("[data-go=trip]");pg.click("[data-go=recs]");pg.click("[data-plan] >> nth=0")
    assert pg.locator("#taCard").count()==0
    hs=[unquote(h) for h in pg.locator("#baseCard a").evaluate_all("e=>e.map(a=>a.href)")];print(hs[:3])
    assert any("site:tripadvisor.com OR site:getyourguide.com" in h for h in hs)
    assert any("hiking tours" in h and "site:getyourguide.com" in h for h in hs) and any("food tours" in h for h in hs)
    t0=[unquote(h) for h in pg.locator(".trip >> nth=0 >> a").evaluate_all("e=>e.map(a=>a.href)")];print(t0)
    assert any("tripadvisor.com/Search?q=" in h for h in t0) and any("getyourguide.com/s/?q=" in h for h in t0)
    assert not any(any("\u0590"<=ch<="\u05ff" for ch in h) for h in t0 if "google.com/maps" not in h),t0
    opts=pg.locator("#taBase option").count()
    if opts>1:
      pg.select_option("#taBase",index=1);assert pg.locator("#baseCard").count()==1
    assert pg.evaluate("document.documentElement.scrollWidth")<=vp["width"]
    pg.screenshot(path=f"shots/{name}-6-links.png",full_page=True)
  b.close()
assert not any("workers.dev" in u for u in reqs)
print("errors",errs);assert not errs;print("OK")
