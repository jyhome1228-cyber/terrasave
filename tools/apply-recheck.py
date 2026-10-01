"""Targeted, idempotent fixes for reproducible post-deployment regressions.
No research copy is changed; do not run the former layout migration again.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
js_path = ROOT / 'assets/js/site.js'
js = js_path.read_text()
marker = '  // Recheck: isolate overlays without changing page layout or copy.'
if marker not in js:
    start = js.index('  const closeMenu = () => {')
    end = js.index('  const escape = value => ', start)
    menu = r'''  // Recheck: isolate overlays without changing page layout or copy.
  const isolated = new Map();
  const isolate = (owner, elements) => {
    for (const element of elements) {
      if (!isolated.has(element)) isolated.set(element, { original: element.inert, owners: new Set() });
      isolated.get(element).owners.add(owner);
      element.inert = true;
    }
  };
  const release = owner => {
    for (const [element, state] of isolated) {
      state.owners.delete(owner);
      if (!state.owners.size) { element.inert = state.original; isolated.delete(element); }
    }
  };
  const closeMenu = () => {
    header?.classList.remove('menu-open');
    document.body.classList.remove('menu-locked');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '메뉴 열기');
    release('menu');
  };
  toggle?.addEventListener('click', () => {
    if (!header || !nav) return;
    const open = !header.classList.contains('menu-open');
    if (!open) { closeMenu(); return; }
    header.classList.add('menu-open');
    document.body.classList.add('menu-locked');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
    isolate('menu', document.querySelectorAll('main, footer, .skip-link'));
    nav.querySelector('a')?.focus({preventScroll:true});
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (!header?.classList.contains('menu-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault(); closeMenu(); toggle?.focus({preventScroll:true});
    }
    if (event.key === 'Tab') {
      const items = [...header.querySelectorAll('a[href],button:not([disabled])')]
        .filter(element => element.getClientRects().length && !element.closest('[inert]'));
      const first = items[0], last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !header.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !header.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  });
  document.addEventListener('click', event => {
    if (header?.classList.contains('menu-open') && !header.contains(event.target)) closeMenu();
  });
  matchMedia('(min-width:1120px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

'''
    js = js[:start] + menu + js[end:]
    old = "  const storage = value => String(value).replaceAll('미숙과','덜 익은 상태').replaceAll('완숙과','먹기 좋은 상태').replaceAll('녹숙과','초록색 상태');"
    new = r'''  const units = value => escape(value).replace(/(-?\d+(?:\.\d+)?(?:[–~±-]\d+(?:\.\d+)?)?\s*(?:°C|℃|%))/g, '<span class="ts-unit">$1</span>');
  const storage = value => String(value).replaceAll('미숙과','덜 익은 상태').replaceAll('완숙과','먹기 좋은 상태').replaceAll('녹숙과','초록색 상태').split(/\s*\/\s*/).map(value => `<span class="ts-storage-line">${units(value)}</span>`).join('');'''
    assert old in js, 'Unexpected card storage formatter'
    js = js.replace(old, new).replace('${escape(storage(fruit.storage))}', '${storage(fruit.storage)}')
    js = js.replace("  if(!dismissed){\n    const previous=document.activeElement;", "  if(!dismissed){\n    closeMenu();\n    const previous=document.activeElement;")
    js = js.replace("    document.body.append(popup);", "    document.body.append(popup);\n    document.body.classList.add('modal-locked');\n    isolate('popup', [...document.body.children].filter(element => element !== popup && element.tagName !== 'SCRIPT'));")
    js = js.replace("popup.remove();previous?.focus();", "popup.remove();document.body.classList.remove('modal-locked');release('popup');previous?.focus({preventScroll:true});")
    js_path.write_text(js)

css_path = ROOT / 'assets/css/site.css'
css = css_path.read_text()
if 'body.modal-locked' not in css:
    css = css.replace('body.menu-locked{overflow:hidden}', '')
    css = css.replace('/* Existing work-in-progress notice remains under owner control. */', '/* Existing work-in-progress notice remains under owner control. */\nbody.menu-locked,body.modal-locked{overflow:hidden}')
    css = css.replace('.ts-update-popup{position:fixed;', '.ts-update-popup{overscroll-behavior:contain;position:fixed;')
    css_path.write_text(css)

removed = 0
for file in ROOT.glob('*.html'):
    html = file.read_text()
    def clean_heading(match):
        global removed
        cleaned, count = re.subn(r'(?:\s*<br\b[^>]*>)+\s*$', '', match[3])
        removed += count
        return '<h' + match[1] + match[2] + '>' + cleaned + '</h' + match[1] + '>'
    html = re.sub(r'<h([1-6])(\b[^>]*)>([\s\S]*?)</h\1>', clean_heading, html)
    if file.name == 'contact.html':
        html = html.replace('class="ts-button header-cta" href="contact.html"', 'class="ts-button header-cta" href="#inquiry"')
        html = html.replace('<a class="nav-contact" href="contact.html">Contact</a>', '<a aria-current="page" class="nav-contact" href="contact.html">Contact</a>')
    html = html.replace('?v=20261001-1', '?v=20261001-2')
    file.write_text(html)
print(f'Recheck applied. Empty heading breaks removed: {removed}; overlay isolation and card units corrected.')
