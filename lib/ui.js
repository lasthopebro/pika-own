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

export function toast(msg) {
  const t = h('div', { class: 'toast' }, msg)
  document.body.append(t)
  setTimeout(() => t.remove(), 3500)
}

let ctx
export function closeMenu() { ctx?.remove(); ctx = null }
export function menu(e, items) {
  closeMenu()
  ctx = h('div', { class: 'ctx' }, items.filter(Boolean).map((i) => i.sep ? h('hr') : h('button', { disabled: !!i.disabled, onclick: () => { closeMenu(); i.fn?.() } }, i.label)))
  document.body.append(ctx)
  const r = ctx.getBoundingClientRect()
  ctx.style.left = Math.max(4, Math.min(e.clientX, innerWidth - r.width - 4)) + 'px'
  ctx.style.top = Math.max(4, Math.min(e.clientY, innerHeight - r.height - 4)) + 'px'
  setTimeout(() => addEventListener('click', closeMenu, { once: true }), 0)
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

// Formular-Dialog. fields: {name,label,type(text|textarea|select|checkbox|number|range|color|datetime-local|password),value,options,rows}
// Liefert die Werte oder null bei Abbruch.
export function ask(title, fields, { ok = 'OK', extra = null } = {}) {
  return new Promise((res) => {
    const inputs = {}
    const rows = fields.map((f) => {
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
    const form = h('form', { method: 'dialog' }, rows, extra,
      h('div', { class: 'btns' }, h('button', { type: 'button', onclick: () => { dlg.close(); finish(null) } }, 'Abbrechen'), h('button', { class: 'primary', type: 'submit' }, ok)))
    const dlg = h('dialog', { class: 'dlg' }, h('h3', {}, title), form)
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const v = {}
      for (const f of fields) {
        const i = inputs[f.name]
        v[f.name] = f.type === 'checkbox' ? i.checked : f.type === 'number' || f.type === 'range' ? Number(i.value) : i.value
      }
      dlg.close(); finish(v)
    })
    dlg.addEventListener('cancel', () => finish(null))
    dlg.addEventListener('close', () => { dlg.remove(); finish(null) })
    document.body.append(dlg)
    dlg.showModal()
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
