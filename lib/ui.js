// Kleine DOM-Helfer: h() Elemente, Kontextmenü, Toast, Dialoge, Formular-Dialog.

export function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v
    else if (k === 'style' && typeof v === 'object') for (const [p, x] of Object.entries(v)) p.startsWith('--') ? e.style.setProperty(p, x) : (e.style[p] = x)
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v)
    else if (v === true) e.setAttribute(k, '')
    else if (v !== false && v != null) e.setAttribute(k, v)
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : String(c))
  return e
}

// action = { label, fn } zeigt einen Knopf (z. B. „Rückgängig“) und lässt den Toast länger stehen.
export function toast(msg, action) {
  const t = h('div', { class: 'toast' }, msg, action ? h('button', { onclick: () => { t.remove(); action.fn() } }, action.label) : null)
  document.body.append(t)
  setTimeout(() => t.remove(), action ? 8000 : 3500)
}

// Nächster Eintrag per Taste: Pfeile (mit Umlauf), Pos1/Ende. i = -1: noch nichts fokussiert. Rein, damit testbar.
export function nextIndex(i, n, key) {
  if (!n) return -1
  if (key === 'Home') return 0
  if (key === 'End') return n - 1
  if (key === 'ArrowDown') return i < 0 ? 0 : (i + 1) % n
  if (key === 'ArrowUp') return i < 0 ? n - 1 : (i - 1 + n) % n
  return i
}
const icon = (name, label) => globalThis.PikaIcons?.icon(name, label) ?? null

let ctx, opener
const away = (ev) => { if (!ev.composedPath().includes(ctx)) closeMenu() }
export function closeMenu(restore) {
  ctx?.remove(); ctx = null
  removeEventListener('click', away)
  if (restore) opener?.focus?.() // Esc: Fokus zurück an das auslösende Element
}
// items: { label, fn, icon, kbd, sub: [Einträge], disabled } oder { sep }. sub ersetzt den Inhalt durch die Unterliste (mit „‹ Zurück“).
export function menu(e, items) {
  closeMenu()
  opener = e.currentTarget instanceof Element ? e.currentTarget : document.activeElement
  const list = items.filter(Boolean)
  const entry = (i) => i.sep ? h('hr', { role: 'separator' }) : h('button', {
    role: 'menuitem', tabindex: -1, disabled: !!i.disabled,
    onclick: () => { if (i.sub) return draw([{ label: '‹ Zurück', keep: () => draw(list) }, { sep: 1 }, ...i.sub]); if (i.keep) return i.keep(); closeMenu(); i.fn?.() },
  }, i.icon ? icon(i.icon) : null, h('span', { class: 'ml' }, i.label + (i.sub ? ' ▸' : '')), i.kbd ? h('kbd', {}, i.kbd) : null)
  const place = () => {
    const r = ctx.getBoundingClientRect(), a = opener?.getBoundingClientRect?.()
    const x = e.clientX || !a ? e.clientX : a.left, y = e.clientY || !a ? e.clientY : a.bottom // per Tastatur geöffnet: am Knopf
    ctx.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + 'px'
    ctx.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + 'px'
  }
  const draw = (rows) => { ctx.replaceChildren(...rows.map(entry)); place(); ctx.querySelector('button:not([disabled])')?.focus() }
  ctx = h('div', { class: 'ctx', role: 'menu', onkeydown: (ev) => {
    const b = [...ctx.querySelectorAll('button:not([disabled])')]
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeMenu(true) }
    else if (ev.key === 'Tab') closeMenu()
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key)) { ev.preventDefault(); b[nextIndex(b.indexOf(document.activeElement), b.length, ev.key)]?.focus() }
  } })
  document.body.append(ctx)
  draw(list)
  setTimeout(() => ctx && addEventListener('click', away), 0)
}

// Dialog mit eigenem Inhalt. buttons: [{label, primary, fn}] ; fn() === false lässt ihn offen.
export function dialog(title, body, buttons = [{ label: 'Schließen' }]) {
  const dlg = h('dialog', { class: 'dlg' }, h('h3', {}, title), body,
    h('div', { class: 'btns' }, buttons.map((b) => h('button', { class: b.primary ? 'primary' : '', onclick: async () => { if ((await b.fn?.()) !== false) dlg.close() } }, b.label))))
  dlg.addEventListener('close', () => dlg.remove())
  document.body.append(dlg)
  dlg.showModal()
  return dlg
}

// Welche Zeilen sind bei Suchtext q sichtbar? items: [{ section: true } | { hay: 'Text' }]. Ein Abschnitt nur, wenn er sichtbare Zeilen hat. Rein, damit testbar.
export function filterSections(items, q = '') {
  const toks = q.toLowerCase().split(/\s+/).filter(Boolean)
  const out = items.map((i) => (i.section ? false : toks.every((t) => i.hay.includes(t))))
  for (let k = items.length - 1, any = false; k >= 0; k--) { if (items[k].section) { out[k] = any; any = false } else any ||= out[k] }
  return out
}

// Formular-Dialog. fields: {name,label,type(text|textarea|select|checkbox|number|range|color|datetime-local|password),value,options,rows,keywords}
// oder { section: 'Titel' } (Abschnittszeile) oder { node: Element, label } (eigene Zeile, z. B. ein Knopf).
// search: true zeigt oben ein Suchfeld (Taste / fokussiert es). Liefert die Werte oder null bei Abbruch.
export function ask(title, fields, { ok = 'OK', extra = null, search = false } = {}) {
  return new Promise((res) => {
    const inputs = {}, meta = []
    const rows = fields.map((f) => {
      if (f.section) { meta.push({ section: true }); return h('h4', { class: 'sec' }, f.section) }
      meta.push({ hay: `${f.label} ${f.name || ''} ${f.keywords || ''}`.toLowerCase() })
      if (f.node) return f.node
      let i
      if (f.type === 'select') i = h('select', {}, f.options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v, selected: String(v) === String(f.value) }, l) }))
      else if (f.type === 'textarea') i = h('textarea', { rows: f.rows || 4 }, f.value ?? '')
      else if (f.type === 'checkbox') i = h('input', { type: 'checkbox', checked: !!f.value })
      else i = h('input', { type: f.type || 'text', value: f.value ?? '', min: f.min, max: f.max, step: f.step, placeholder: f.placeholder })
      inputs[f.name] = i
      return h('label', { class: 'row' }, h('span', {}, f.label), i)
    })
    let done = false
    const finish = (v) => { if (!done) { done = true; res(v) } }
    const none = h('p', { class: 'muted', hidden: true }, 'Keine passende Option.')
    const find = search ? h('input', { type: 'search', class: 'dsearch', placeholder: 'Suchen … (Taste /)', 'aria-label': 'Optionen durchsuchen', oninput: () => {
      const vis = filterSections(meta, find.value)
      rows.forEach((r, k) => { r.hidden = !vis[k] })
      none.hidden = vis.some(Boolean)
    }, onkeydown: (e) => { if (e.key === 'Enter' || (e.key === '/' && !find.value)) e.preventDefault() } }) : null
    const form = h('form', { method: 'dialog' }, find, rows, none, extra,
      h('div', { class: 'btns' }, h('button', { type: 'button', onclick: () => { dlg.close(); finish(null) } }, 'Abbrechen'), h('button', { class: 'primary', type: 'submit' }, ok)))
    const dlg = h('dialog', { class: 'dlg' }, h('h3', {}, title), form)
    if (find) dlg.addEventListener('keydown', (e) => { if (e.key === '/' && e.target !== find && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); find.focus() } })
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const v = {}
      for (const f of fields) {
        const i = inputs[f.name]
        if (!i) continue
        v[f.name] = f.type === 'checkbox' ? i.checked : f.type === 'number' || f.type === 'range' ? Number(i.value) : i.value
      }
      dlg.close(); finish(v)
    })
    dlg.addEventListener('cancel', () => finish(null))
    dlg.addEventListener('close', () => { dlg.remove(); finish(null) })
    document.body.append(dlg)
    dlg.showModal()
    find?.focus()
  })
}

// Buchstaben-Kachel; mit favicons=true wird zusätzlich /favicon.ico der Seite geladen (Netzwerkzugriff!).
export function tile(domain, favicons) {
  let hue = 0
  for (const c of domain) hue = (hue * 31 + c.charCodeAt(0)) % 360
  const t = h('span', { class: 'tile', style: { background: `hsl(${hue} 55% 45%)` } }, (domain[0] || '?').toUpperCase())
  if (favicons && domain) t.append(h('img', { src: `https://${domain}/favicon.ico`, onerror: (e) => e.target.remove(), loading: 'lazy' }))
  return t
}
