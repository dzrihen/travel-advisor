import json
from playwright.sync_api import sync_playwright
U="http://localhost:8765/";errs=[];W="https://travel-advisor-proxy.daniel-zrihen.workers.dev"
PNG=b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\xf0\x1f\x00\x05\x00\x01\xff\x89\x99=\x1d\x00\x00\x00\x00IEND\xaeB`\x82'
ITEMS=[{"id":"1","name":"מוזיאון העיר","rating":4.2,"num_reviews":800,"url":"https://www.tripadvisor.com/1","photo":"https://img.test/a.png","description":"Historic museum in the old town","category":"attraction","subcategories":["Museums"],"groups":[]},
 {"id":"2","name":"מסלול הליכה לאגם","rating":4.8,"num_reviews":3200,"url":"https://www.tripadvisor.com/2","photo":"https://img.test/b.png","description":"Scenic hiking trail with waterfall views","category":"attraction","subcategories":["Hiking Trails","Waterfalls"],"groups":["Nature & Parks"]},
 {"id":"3","name":"<script>x</script>קניון","rating":3.9,"num_reviews":120,"url":"javascript:alert(1)","photo":None,"description":"","category":"Shopping","subcategories":["Shopping Malls"],"groups":[]}]
def run(mode):
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name,vp in [("desktop",{"width":1280,"height":900}),("mobile",{"width":390,"height":844})]:
      pg=b.new_page(viewport=vp);pg.on("console",lambda m:m.type=="error" and errs.append(m.text));pg.on("pageerror",lambda e:errs.append(str(e)))
      H={"Access-Control-Allow-Origin":"http://localhost:8765","content-type":"application/json"}
      pg.route("https://img.test/**",lambda r:r.fulfill(body=PNG,content_type="image/png"))
      pg.route(W+"/health",lambda r:r.fulfill(json={"ok":True,"ta":mode=="ok","gyg":False},headers=H))
      pg.route(W+"/ta/search**",lambda r:r.fulfill(body=json.dumps({"source":"tripadvisor","items":ITEMS,"cached":False}),headers=H))
      pg.goto(U);pg.evaluate("localStorage.clear()");pg.reload()
      for k in ["trek","nature"]:pg.click(f".lv[data-k={k}] button >> nth=3")
      pg.click("[data-go=trip]");pg.click("[data-go=recs]");pg.click("[data-plan] >> nth=0")
      if mode=="ok":
        pg.wait_for_selector(".tai");names=pg.locator(".tai b").all_inner_texts();print(name,names)
        assert names[0]=="מסלול הליכה לאגם";assert pg.locator(".tai script").count()==0
        assert pg.get_attribute(".tai >> nth=2 >> a","href")=="#"
        pg.locator("#taCard").scroll_into_view_if_needed();pg.wait_for_timeout(300)
        pg.locator("#taCard").screenshot(path=f"shots/{name}-5-tripadvisor.png")
      else:
        pg.wait_for_selector("#taBody .note");assert pg.locator(".trip").count()>=3
        pg.locator("#taCard").screenshot(path=f"shots/{name}-5-ta-fallback.png")
      assert pg.evaluate("document.documentElement.scrollWidth")<=vp["width"]
    b.close()
run("ok");run("nokey")
print("errors",errs);assert not errs;print("OK")
