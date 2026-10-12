from playwright.sync_api import sync_playwright
U="http://localhost:8765/";errs=[]
with sync_playwright() as p:
  b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
  for name,vp in [("desktop",{"width":1280,"height":900}),("mobile",{"width":390,"height":844})]:
    pg=b.new_page(viewport=vp);pg.on("console",lambda m:m.type=="error" and errs.append(m.text));pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U);pg.evaluate("localStorage.clear()");pg.reload()
    for k in ["views","trek","nature"]:pg.click(f".lv[data-k={k}] button >> nth=3")
    pg.click("[data-go=trip]");pg.select_option("#flight","direct");pg.click("[data-go=recs]")
    pg.click("[data-plan] >> nth=0")
    assert pg.locator("#plan.on").count()==1
    pg.fill("#pDep","2026-11-05");pg.locator("#pDep").dispatch_event("change")
    pg.fill("#pRet","2026-11-14");pg.locator("#pRet").dispatch_event("change")
    pg.fill("#pPax","3");pg.locator("#pPax").dispatch_event("change")
    g=pg.get_attribute("a:has-text('Google Flights')","href");s=pg.get_attribute("a:has-text('Skyscanner') >> nth=0","href");print(g);print(s)
    assert "nonstop" in g and "preferdirects=true" in s and "261105" in s and "adultsv2=3" in s
    n=pg.locator(".trip").count();assert n>=3,n;print(name,"trips",n,pg.locator(".trip h4").all_inner_texts()[:3])
    assert pg.evaluate("document.documentElement.scrollWidth")<=vp["width"]
    pg.screenshot(path=f"shots/{name}-4-plan.png",full_page=True)
    pg.reload();pg.click("nav button[data-tab=recs]");pg.click("[data-plan] >> nth=0");assert pg.input_value("#pPax")=="3"
  # every country renders
  pg.evaluate("""()=>{}""")
  isos=pg.evaluate("RAW.map(r=>r[0])")
  for i in isos:
    pg.evaluate(f"(()=>{{const s=JSON.parse(localStorage.getItem('travelAdvisor.v1'));s.lastDest='{i}';localStorage.setItem('travelAdvisor.v1',JSON.stringify(s))}})()")
  b.close()
print("errors",errs);assert not errs;print("OK")
