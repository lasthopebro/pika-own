// Horizontale Leiste wie eine Lesezeichenleiste. Klassisches Skript ohne Importe, damit der Neue Tab
// und das Content-Script (Webseiten) dieselbe Datei laden. Daten und Aktionen laufen über Nachrichten an den Hintergrund.
(() => {
  const B = globalThis.browser ?? globalThis.chrome
  const call = (type, data = {}) => B.runtime.sendMessage({ type, ...data })
  const CSS = `.pb{display:flex;align-items:center;gap:4px;height:30px;padding:0 6px;box-sizing:border-box;width:100%;font:12px system-ui,sans-serif;background:var(--pb-bg,#1f2937);color:var(--pb-fg,#f3f4f6)}
.pb-list{display:flex;gap:4px;flex:1;min-width:0;overflow:hidden;align-items:center}
.pb button,.pb a{all:unset;box-sizing:border-box;cursor:pointer;padding:3px 8px;border-radius:6px;white-space:nowrap;color:inherit;font:inherit;display:inline-flex;gap:5px;align-items:center}
.pb button:hover,.pb a:hover,.pb-menu button:hover{background:#ffffff26}
.pb-sep{width:1px;height:16px;background:#ffffff40;flex:none}.pb-live{color:#4ade80;font-size:10px}
.pb-menu{position:fixed;z-index:2147483647;min-width:200px;max-width:320px;max-height:70vh;overflow:auto;background:#111827;color:#f3f4f6;border:1px solid #ffffff30;border-radius:8px;padding:4px;font:12px system-ui,sans-serif;box-shadow:0 8px 24px #0008}
.pb-menu button{all:unset;box-sizing:border-box;display:block;width:100%;padding:5px 8px;border-radius:5px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pb-menu .pb-it{display:flex}.pb-menu .pb-it button:last-child{width:auto;opacity:.6}.pb-menu hr{border:0;border-top:1px solid #ffffff30;margin:4px 0}.pb-menu .pb-dim{opacity:.6;padding:5px 8px}`

  // Wie viele Einträge passen in avail Pixel? Bei Überlauf bleibt Platz für „»“. Rein, damit testbar.
  function splitOverflow(widths, avail, gap = 4, moreW = 30) {
    let used = 0
    for (let i = 0; i < widths.length; i++) {
      const reserve = i < widths.length - 1 ? moreW + gap : 0
      if (used + widths[i] + reserve > avail) return i
      used += widths[i] + gap
    }
    return widths.length
  }

  function el(tag, props = {}, ...kids) {
    const e = document.createElement(tag)
    for (const [k, v] of Object.entries(props)) {
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v)
      else if (k === 'class') e.className = v
      else if (v != null && v !== false) e.setAttribute(k, v)
    }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : String(c))
    return e
  }
  const short = (s, n = 22) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

  // host: Element oder ShadowRoot. opts.host = Domain der Seite (für die Ausschlussliste), opts.onChange(data) nach jedem Laden.
  function mount(host, opts = {}) {
    const style = el('style'); style.textContent = CSS
    const bar = el('div', { class: 'pb' })
    const list = el('div', { class: 'pb-list' })
    host.append(style, bar)
    let data = null, menuEl = null
    const closeMenu = () => { menuEl?.remove(); menuEl = null }
    host.addEventListener('click', (e) => { if (menuEl && !menuEl.contains(e.target)) closeMenu() })
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu() })

    const showMenu = (anchor, rows) => {
      closeMenu()
      menuEl = el('div', { class: 'pb-menu' }, rows)
      host.append(menuEl)
      const r = anchor.getBoundingClientRect()
      menuEl.style.left = Math.max(4, Math.min(r.left, innerWidth - menuEl.offsetWidth - 4)) + 'px'
      menuEl.style.top = r.bottom + 2 + 'px'
    }
    const act = async (type, payload) => { closeMenu(); const r = await call(type, payload); return r }
    const lf = async (op, ...args) => { await act('lf', { op, args }); await refresh() }
    const row = (text, fn) => el('button', { onclick: (e) => { e.stopPropagation(); closeMenu(); fn() } }, text)

    const folderMenu = (anchor, f) => {
      const rows = f.items.map((i) => el('div', { class: 'pb-it' },
        row((i.live ? '● ' : '') + short(i.t, 40), () => act('focusOrOpen', { url: i.u })),
        f.ro ? null : row('✕', () => lf('unassign', i.u))))
      if (!rows.length) rows.push(el('div', { class: 'pb-dim' }, 'Leer'))
      rows.push(el('hr'))
      if (f.items.length) rows.push(row('Alle öffnen', async () => { for (const i of f.items) await act('focusOrOpen', { url: i.u, background: true }) }))
      if (!f.ro) {
        rows.push(row('Tab hinzufügen ▸', () => {
          const free = data.tabs.filter((t) => !f.items.some((i) => i.u === t.u)).slice(0, 15)
          showMenu(anchor, free.length ? free.map((t) => row(short(t.t || t.u, 40), () => lf('assign', f.id, t.u, t.t))) : [el('div', { class: 'pb-dim' }, 'Keine offenen Tabs')])
        }))
        rows.push(row('Als Sitzung speichern', () => act('folderSession', { id: f.id })))
        rows.push(row('Umbenennen …', () => { const n = prompt('Name', f.name); if (n) lf('rename', f.id, n) }))
        rows.push(row('Symbol (Emoji) …', () => { const n = prompt('Symbol', f.icon); if (n) lf('rename', f.id, '', n.trim().slice(0, 4)) }))
        rows.push(row('Ordner löschen', () => { if (confirm(`„${f.name}“ löschen? Die Tabs bleiben offen.`)) lf('remove', f.id) }))
      }
      showMenu(anchor, rows)
    }
    const nodeFor = (en) => en.f
      ? el('button', { title: en.f.name, onclick: (e) => { e.stopPropagation(); folderMenu(e.currentTarget, en.f) } }, en.f.icon, short(en.f.name, 16), en.f.items.some((i) => i.live) ? el('span', { class: 'pb-live' }, '●' + en.f.items.filter((i) => i.live).length) : null)
      : el('a', { href: en.u, title: en.u, onclick: (e) => { e.preventDefault(); act('open', { url: en.u }) }, onauxclick: (e) => { e.preventDefault(); act('open', { url: en.u, newTab: true }) } }, short(en.t))

    function draw() {
      const entries = [...data.folders.map((f) => ({ f })), { sep: true }, ...data.bm, { sep: true }, ...data.quick].filter((e, i, a) => !e.sep || (i > 0 && !a[i - 1].sep && i < a.length - 1))
      const nodes = entries.map((en) => (en.sep ? el('span', { class: 'pb-sep' }) : nodeFor(en)))
      list.replaceChildren(...nodes)
      const ctl = [
        el('button', { title: 'Neuer Live-Ordner', onclick: () => { const n = prompt('Name des Live-Ordners'); if (n) lf('add', n) } }, '＋'),
        el('button', { title: 'Tabs mit KI sortieren', onclick: () => act('openAi') }, '✨'),
        opts.onCollapse ? el('button', { title: 'Leiste einklappen', onclick: opts.onCollapse }, '▴') : null,
      ]
      bar.replaceChildren(list, ...ctl.filter(Boolean))
      const widths = nodes.map((n) => n.offsetWidth)
      const keep = splitOverflow(widths, list.clientWidth)
      if (keep < nodes.length) {
        const more = el('button', { title: 'Mehr' }, '»')
        more.onclick = (e) => { e.stopPropagation(); showMenu(more, entries.slice(keep).filter((en) => !en.sep).map((en) => (en.f ? row(en.f.icon + ' ' + en.f.name, () => folderMenu(more, en.f)) : row(short(en.t, 40), () => act('open', { url: en.u }))))) }
        nodes.slice(keep).forEach((n) => n.remove())
        list.append(more)
      }
    }
    async function refresh() {
      data = await call('getBar', { host: opts.host || '' })
      if (!data || data.error) return
      opts.onChange?.(data)
      if (!data.hidden) draw()
    }
    let t
    B.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.pika) { clearTimeout(t); t = setTimeout(refresh, 150) } })
    B.runtime.onMessage.addListener((m) => { if (m?.type === 'tabsChanged') { clearTimeout(t); t = setTimeout(refresh, 300) } })
    addEventListener('resize', () => data && !data.hidden && draw())
    return refresh().then(() => ({ refresh }))
  }
  globalThis.PikaBar = { mount, splitOverflow }
})()