from playwright.sync_api import sync_playwright
U="http://localhost:8765/";errs=[]
with sync_playwright() as p:
  b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
  for name,vp in [("desktop",{"width":1280,"height":900}),("mobile",{"width":390,"height":844})]:
    pg=b.new_page(viewport=vp);pg.on("console",lambda m:m.type=="error" and errs.append(m.text));pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U);pg.evaluate("localStorage.clear()");pg.reload()
    for c in ["יוון","איטליה","קפריסין"]:
      pg.fill("#q",c);pg.click(f".c:has-text('{c}')")
    pg.fill("#q","");pg.click(".c.v .ed >> nth=0");pg.fill("#dlgC","רומא, פירנצה");pg.click("#dlg .primary")
    for k,l in [("views",3),("trek",3),("food",2),("road",2)]:
      pg.click(f".lv[data-k={k}] button >> nth={l}")
    pg.screenshot(path=f"shots/{name}-1-profile.png",full_page=True)
    pg.click("[data-go=trip]");pg.select_option("#month","6");pg.screenshot(path=f"shots/{name}-2-trip.png",full_page=True)
    pg.click("[data-go=recs]");n=pg.locator(".card").count();assert n>=10,n
    t=pg.locator(".card h3").all_inner_texts()[:5];print(name,n,t)
    assert not any("יוון" in x for x in t)
    pg.screenshot(path=f"shots/{name}-3-recs.png",full_page=False)
    sw=pg.evaluate("document.documentElement.scrollWidth");assert sw<=vp["width"],sw
    pg.click("nav button[data-tab=trip]");pg.check("#revisit");pg.click("[data-go=recs]")
    print("revisit top:",pg.locator(".card h3").all_inner_texts()[:3])
  b.close()
print("errors:",errs);assert not errs
