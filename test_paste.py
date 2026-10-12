from playwright.sync_api import sync_playwright
U="http://localhost:8765/";errs=[]
MESSY='''מדינות שביקרתי:
1. ארה"ב – ניו יורק, מיאמי
2) אנגליה - לונדון
• הולנד
- צ׳כיה (פראג)
🇹🇭 תאילנד
Italy – Rome; Spain, PORTUGAL\tgr
* USA
UK
the Netherlands
Czech Republic
גאורגיה - טביליסי
Viet Nam
יפאן
blahblahland
'''
with sync_playwright() as p:
  b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
  ctx=b.new_context(viewport={"width":390,"height":844});pg=ctx.new_page()
  pg.on("console",lambda m:m.type=="error" and errs.append(m.text));pg.on("pageerror",lambda e:errs.append(str(e)))
  pg.goto(U);pg.evaluate("localStorage.clear()");pg.reload()
  pg.fill("#q","קפריסין");pg.click(".c:has-text('קפריסין')");pg.fill("#q","")
  assert "נשמר" in pg.inner_text("#saved")
  pg.click("#pasteBtn");pg.fill("#ptext",MESSY);pg.click("#pparse")
  m=pg.locator(".pm span").all_inner_texts();print("matched",m);print("unmatched",pg.locator(".um code").all_inner_texts())
  for n in ["ארצות הברית","בריטניה","הולנד","צ'כיה","תאילנד","איטליה","ספרד","פורטוגל","יוון","גאורגיה","וייטנאם","יפן"]:
    assert any(n in x for x in m),n
  pg.screenshot(path="shots/paste-preview.png",full_page=True)
  pg.select_option(".um select >> nth=-1","IS")
  pg.click("#papply")
  v=pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('travelAdvisor.v1')).visited).sort()");print(v)
  assert "CY" in v and "IS" in v and len(v)==14,v
  pg.click(".lv[data-k=views] button >> nth=3")
  pg.reload();pg.wait_for_timeout(300)
  assert pg.inner_text("#vcount")=="14";assert "on" in pg.get_attribute(".lv[data-k=views] button >> nth=3","class")
  open("/tmp/l.csv","w").write("country\nNorway\nצרפת\n")
  pg.click("#pasteBtn");pg.set_input_files("#pfile","/tmp/l.csv");pg.wait_for_timeout(300)
  print("file",pg.locator(".pm span").all_inner_texts());pg.click("#papply");pg.reload()
  assert pg.inner_text("#vcount")=="16"
  pg.screenshot(path="shots/paste-after-reload.png");b.close()
print("errors",errs);assert not errs;print("OK")
