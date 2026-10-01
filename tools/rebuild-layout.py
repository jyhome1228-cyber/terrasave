"""One-time migration from accumulated overrides to the TerraSave component system.
Preserves source content, recovers fruit research branches, and flattens headings.
Run from repository root. Subsequent runs are no-ops.
"""
import os, re, json, shutil, pathlib
from bs4 import BeautifulSoup, NavigableString

ROOT=pathlib.Path.cwd()
if 'assets/js/fruit-detail.js' in (ROOT/'fruit.html').read_text():
    print('Component migration already applied.'); raise SystemExit(0)
source=(ROOT/'fruit.html').read_text()
public=sorted(ROOT.glob('*.html'))

def soup(value): return BeautifulSoup(value,'html.parser')
def text(tag): return tag.get_text(' ',strip=True) if tag else ''
def inner(tag): return tag.decode_contents().strip() if tag else ''
def normalize_text(value): return re.sub(r'\s+','',soup(value).get_text()).replace('샤인머스캣','샤인머스켓').replace('TERRASAVE','TerraSave')
def paragraphs(tag):
    if tag is None:return []
    html=inner(tag)
    pieces=re.split(r'(?:<br\s*/?>\s*){2,}',html)
    return [re.sub(r'<br\s*/?>',' ',p).strip() for p in pieces if soup(p).get_text(strip=True)]

def head(section):
    h=section.select_one('.ts-section-head')
    return {'kicker':text(h.select_one('.ts-kicker')),'title':inner(h.select_one('h1,h2')),'paragraphs':[p for e in h.select('p') for p in paragraphs(e)]}

def cards(section):
    result=[]
    for e in section.select('.ts-approach'):
        result.append({'kicker':text(e.select_one('.ts-kicker')),'title':inner(e.select_one('h3')),'paragraphs':[p for x in e.select('p') for p in paragraphs(x)]})
    return result

# Capture rendered copy before removing obsolete runtime rewriting.
from playwright.sync_api import sync_playwright
rendered={}
with sync_playwright() as pw:
    exe=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
    browser=pw.chromium.launch(headless=True,**({'executable_path':exe} if exe else {}))
    for file in public:
        if file.name=='fruit.html':continue
        original=soup(file.read_text())
        inline_scripts=[e.string or '' for e in original.select('script:not([src])')]
        for e in original.select('script,link[rel="stylesheet"],style'):e.decompose()
        page=browser.new_page(viewport={'width':1440,'height':960})
        page.route('**/*',lambda route:route.abort())
        page.set_content(str(original),wait_until='domcontentloaded')
        if file.name in ['index.html','fruits.html']:
            for asset in ['fruits.js','fruit-images.js']:page.add_script_tag(content=(ROOT/'assets/js'/asset).read_text())
        runtime=(ROOT/'assets/js/main.js').read_text()
        runtime=re.sub(r"ensureStylesheet\('assets/css/[^']+'\);",'',runtime)
        runtime=re.sub(r"const currentPath = [^;]+;",'const currentPath = '+json.dumps(file.name)+';',runtime)
        runtime=runtime.replace('location.href',json.dumps('https://terrasave.local/'+file.name))
        page.add_script_tag(content=runtime)
        for code in inline_scripts:
            if code.strip():page.add_script_tag(content=code)
        page.evaluate('typeof applySiteCopy === "function" && applySiteCopy()')
        rendered[file.name]=page.evaluate("({main:document.querySelector('main').outerHTML,title:document.title,description:document.querySelector('meta[name=description]')?.content,footer:document.querySelector('footer').outerHTML})")
        page.close()
    browser.close()

# Recover authored data from source fragments independently of broken ternary paths.
sections=[soup(m.group()).section for m in re.finditer(r'<section\b[^>]*>[\s\S]*?</section>',source)]
contents={}; manifest={}
for slug,label in [('avocado','AVOCADO / HASS'),('shine-muscat','SHINE MUSCAT'),('strawberry','STRAWBERRY / SEOLHYANG')]:
    start=next(i for i,s in enumerate(sections) if s.select_one('.ts-section-head>.ts-kicker') and text(s.select_one('.ts-section-head>.ts-kicker'))==label)
    problem,existing,solution=sections[start:start+3]
    rows=[]
    for row in problem.select('.ts-application-row'):
        rows.append({'title':inner(row.select_one('strong')),'paragraphs':[p for e in row.select('p') for p in paragraphs(e)]})
    contents[slug]={'problem':{**head(problem),'rows':rows},'existing':{**head(existing),'cards':cards(existing)},'solution':{**head(solution),'cards':cards(solution)}}
    manifest[slug]=[normalize_text(inner(p)) for s in [problem,existing,solution] for p in s.select('p') if text(p)]

research=list(re.finditer(r'<div class="ts-detail-research-block">[\s\S]*?</div>',source))
refs=list(re.finditer(r'<div class="ts-detail-references">[\s\S]*?</div>',source))
assert len(research)==16, f'Unexpected source structure: {len(research)} research blocks'
for slug,first,end in [('avocado',0,5),('shine-muscat',5,8),('strawberry',8,14)]:
    blocks=[]
    for m in research[first:end]:
        block=soup(m.group()).div
        heading=text(block.h3)
        ps=[p for e in block.find_all('p',recursive=False) for p in paragraphs(e)]
        if slug=='shine-muscat' and heading.startswith('샤인머스켓'):
            heading=text(soup(ps.pop(0)))
        heading=re.sub(r'^\d+\.\s*','',heading)
        blocks.append({'title':heading,'paragraphs':ps})
        manifest[slug].extend(normalize_text(p) for p in ps)
    # Keep both original paragraphs, but use one condensation heading.
    if slug=='strawberry':
        blocks[3]['paragraphs']+=blocks[4]['paragraphs'];blocks.pop(4)
    ref=next(m for m in refs if m.start()>research[end-1].start())
    ref_dom=soup(ref.group()).div
    items=[p.strip() for p in re.split(r'<br\s*/?>',inner(ref_dom)) if soup(p).get_text(strip=True)]
    ref_title=text(soup(items.pop(0)))
    contents[slug]['research']={'blocks':blocks,'references':items,'referenceTitle':ref_title}
    manifest[slug].extend(normalize_text(p) for p in items)

(ROOT/'assets/js/fruit-content.js').write_text('/* Source-derived authored content; rendering is shared for all fruit profiles. */\nwindow.TERRASAVE_FRUIT_CONTENT = '+json.dumps(contents,ensure_ascii=False,indent=2)+';\n')
(ROOT/'tools/content-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
static_manifest={}
for filename,data in rendered.items():
    dom=soup(data['main'])
    for grid in dom.select('#fruitGrid,#homeFruitGrid'):grid.decompose()
    static_manifest[filename]=[normalize_text(inner(e)) for e in dom.select('p,li') if text(e)]
(ROOT/'tools/static-content-manifest.json').write_text(json.dumps(static_manifest,ensure_ascii=False,indent=2))
nav=[('about.html','About TerraSave'),('product.html','Product'),('fruits.html','Freshness Library'),('partnership.html','Partnership'),('why-terrasave.html','Why TerraSave')]

def header_html(current):
    active='fruits.html' if current=='fruit.html' else current
    links=''.join(f'<a href="{url}"'+(' aria-current="page"' if url==active else '')+f'>{name}</a>' for url,name in nav)
    links+='<a href="contact.html" class="nav-contact">Contact</a>'
    return f'<a class="skip-link" href="#main-content">본문 바로가기</a><header class="site-header" id="siteHeader"><div class="ts-shell header-inner"><a class="brand" href="index.html" aria-label="TerraSave Home"><img class="brand-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" width="136" height="28"></a><nav class="nav" id="siteNav" aria-label="주 메뉴">{links}</nav><a class="ts-button header-cta" href="contact.html">포장 상담하기</a><button class="menu-toggle" id="menuToggle" type="button" aria-label="메뉴 열기" aria-controls="siteNav" aria-expanded="false"><span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span></button></div></header>'

footer=soup(rendered['index.html']['footer']).footer
footer.select_one('a[href="about.html"]').string='About TerraSave'
for image in footer.select('img'):image['width']='150';image['height']='30'
for p in public:
    doc=soup(p.read_text())
    for old in doc.select('style,link[rel="stylesheet"],script'):old.decompose()
    css=doc.new_tag('link',rel='stylesheet',href='assets/css/site.css?v=20261001-1');doc.head.append(css)
    favicon=doc.select_one('link[rel="icon"]')
    if not favicon:
        favicon=doc.new_tag('link',rel='icon',href='assets/img/terrasave-favicon.svg',type='image/svg+xml');doc.head.append(favicon)
    if p.name!='fruit.html':
        doc.main.replace_with(soup(rendered[p.name]['main']).main)
        if rendered[p.name]['title']:doc.title.string=rendered[p.name]['title']
        if rendered[p.name]['description']:doc.select_one('meta[name="description"]')['content']=rendered[p.name]['description']
    else:
        doc.main.clear()
        doc.main.append(soup('<noscript><section class="ts-page-hero"><div class="ts-shell"><h1 class="ts-h1">과일별 신선도 자료</h1><p class="ts-body">과일 상세를 보려면 자바스크립트를 활성화해 주세요.</p><a class="ts-link" href="fruits.html">Freshness Library</a></div></section></noscript>'))
    doc.main['id']='main-content'
    if p.name=='fruit.html':doc.main['data-fruit-detail']=''
    if doc.header:doc.header.replace_with(soup(header_html(p.name)))
    doc.footer.replace_with(soup(str(footer)))
    classes=doc.body.get('class',[])
    classes.append('ts-'+p.stem.replace('index','home')+'-page')
    doc.body['class']=list(dict.fromkeys(classes))
    # Semantic paragraph separation, not viewport-specific hard wraps.
    for para in list(doc.select('main p')):
        segments=paragraphs(para)
        if len(segments)>1:
            wrap=doc.new_tag('div');wrap['class']=['ts-paragraphs']+para.get('class',[])
            for seg in segments:
                sub=doc.new_tag('p');sub.append(soup(seg));wrap.append(sub)
            para.replace_with(wrap)
        elif segments:
            para.clear();para.append(soup(segments[0]))
    # Flat heading markup prevents mixed grid and margin inheritance.
    for heading in doc.select('.ts-section-head,.ts-home-head'):
        for wrapper in list(heading.find_all('div',recursive=False)):
            if not wrapper.select_one('a,button'):wrapper.unwrap()
            elif wrapper.find(['h1','h2']):wrapper.unwrap()
    for br in doc.select('main h1 br,main h2 br'):
        br['class']=['desktop-break'];br.insert_after(NavigableString(' '))
    for e in doc.select('main [style]'):
        style=e['style']
        if e.name=='div' and e.find('a',recursive=False):
            e['class']=list(dict.fromkeys(e.get('class',[])+['ts-action-group']+(['is-centered'] if 'center' in style else [])))
        del e['style']
    for h in doc.select('.ts-section-head,.ts-product-hero-head'):
        for e in h.find_all('div',recursive=False):
            if e.select_one('a'):e['class']=list(dict.fromkeys(e.get('class',[])+['ts-action-group','is-centered']))
    for grid in doc.select('.ts-approach-grid'):grid['data-columns']=str(len(grid.select(':scope > .ts-approach')))
    for e in doc.select('.ts-product-visual-inner'):
        # Reserved asset slot: no internal production labels in public copy.
        name=text(e.strong).replace(' 제품 이미지','')
        type_label={'TerraPACK':'PET 포장용기','TerraShield':'매쉬망','TerraCover':'대형 비닐'}.get(name,'')
        e.clear();e.append(soup(f'<span class="ts-kicker">{type_label}</span><strong>{name}</strong>'))
    for e in doc.select('.ts-kicker'):
        if e.string:e.string=e.string.replace('TERRASAVE','TerraSave')
    if p.name=='partnership.html':
        condition=doc.select_one('.ts-condition-grid')
        condition.clear()
        for term in ['수분 특성','호흡 특성','에틸렌 발생 및 민감도','저장 온도','상대습도','포장 형태','운송 거리','운송 기간','출하시기']:
            condition.append(soup('<div><strong>'+term+'</strong></div>'))
    if p.name in ['index.html','fruits.html']:
        for grid in doc.select('#fruitGrid,#homeFruitGrid'):grid.clear()
    files=['assets/js/fruits.js','assets/js/fruit-images.js'] if p.name in ['index.html','fruits.html','fruit.html'] else []
    if p.name=='fruit.html':files+=['assets/js/fruit-content.js','assets/js/fruit-detail.js']
    files+=['assets/js/site.js']
    for file in files:doc.body.append(doc.new_tag('script',src=file+'?v=20261001-1'))
    p.write_text(str(doc).replace('<html>','<html lang="ko">'))
print('Migrated',len(public),'public HTML files; recovered research for',', '.join(contents))
print('Authored content checks:',{k:len(v) for k,v in manifest.items()})
print('Static content checks:',{k:len(v) for k,v in static_manifest.items()})
