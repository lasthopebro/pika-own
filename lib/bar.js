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
.pb-menu .pb-it{display:flex}.pb-menu .pb-it button:last-child{width:auto;opacity:.6}.pb-menu hr{border:0;border-top:1px solid #ffffff30;margin:4px 0}.pb-menu .pb-dim{opacity:.6;padding:5px 8px}
.pb .pb-drop{outline:2px dashed #4ade80;outline-offset:-2px}
.pb svg{flex:none;display:block}.pb-menu svg{display:inline-block;vertical-align:-3px;margin-right:6px}
.pb button:focus-visible,.pb a:focus-visible,.pb-menu button:focus-visible{outline:2px solid #4ade80;outline-offset:-2px}.pb-menu button:focus{background:#ffffff26}
.pb-menu .pb-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:2px}.pb-menu .pb-grid button{text-align:center;padding:5px 0;font-size:16px}
.pb.v{flex-direction:column;align-items:stretch;height:auto;padding:4px}.pb.v .pb-list{flex-direction:column;align-items:stretch;overflow:visible}.pb.v .pb-sep{width:auto;height:1px;margin:3px 0}`

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
  // Nächster Eintrag per Taste (Menü und Raster). i = -1: noch nichts fokussiert. Rein, damit testbar. (Gleiche Logik wie lib/ui.js, dort als Modul.)
  function nextIndex(i, n, key, grid = false) {
    if (!n) return -1
    const down = key === 'ArrowDown' || (grid && key === 'ArrowRight'), up = key === 'ArrowUp' || (grid && key === 'ArrowLeft')
    if (key === 'Home') return 0
    if (key === 'End') return n - 1
    if (down) return i < 0 ? 0 : (i + 1) % n
    if (up) return i < 0 ? n - 1 : (i - 1 + n) % n
    return i
  }
  // Erste http(s)-Adresse aus einem Ziehen (text/uri-list ohne #-Kommentare, sonst Text). Rein, damit testbar.
  function urlFromDrop(dt) {
    const raw = dt.getData('text/uri-list') || dt.getData('text/plain') || ''
    const u = raw.split(/\r?\n/).map((s) => s.trim()).find((s) => s && !s.startsWith('#'))
    return u && /^https?:\/\/\S+$/i.test(u) ? u : ''
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
  const ic = (name, label) => (globalThis.PikaIcons ? PikaIcons.icon(name, label) : label)
  const short = (s, n = 22) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

  // host: Element oder ShadowRoot. opts.host = Domain der Seite (für die Ausschlussliste), opts.onChange(data) nach jedem Laden.
  function mount(host, opts = {}) {
    const style = el('style'); style.textContent = CSS
    const bar = el('div', { class: opts.vertical ? 'pb v' : 'pb' })
    const list = el('div', { class: 'pb-list' })
    host.append(style, bar)
    let data = null, menuEl = null, menuAnchor = null
    const closeMenu = () => { menuEl?.remove(); menuEl = null }
    host.addEventListener('click', (e) => { if (menuEl && !menuEl.contains(e.target)) closeMenu() })
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu() })

    const showMenu = (anchor, rows) => {
      closeMenu()
      menuEl = el('div', { class: 'pb-menu', role: 'menu' }, rows)
      menuAnchor = anchor
      menuEl.addEventListener('keydown', menuKeys)
      host.append(menuEl)
      const r = anchor.getBoundingClientRect()
      menuEl.style.left = Math.max(4, Math.min(r.left, innerWidth - menuEl.offsetWidth - 4)) + 'px'
      menuEl.style.top = r.bottom + 2 + 'px'
      menuEl.querySelector('button')?.focus()
    }
    // Tastatur: Pfeile/Pos1/Ende wechseln, Enter löst den Knopf aus, Esc schließt und gibt den Fokus zurück.
    const menuKeys = (e) => {
      const b = [...menuEl.querySelectorAll('button')]
      if (e.key === 'Escape') { e.stopPropagation(); const a = menuAnchor; closeMenu(); a?.focus?.() }
      else if (e.key === 'Tab') closeMenu()
      else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        b[nextIndex(b.indexOf(host.getRootNode().activeElement), b.length, e.key, !!menuEl.querySelector('.pb-grid'))]?.focus()
      }
    }
    const act = async (type, payload) => { closeMenu(); const r = await call(type, payload); return r }
    const lf = async (op, ...args) => { await act('lf', { op, args }); await refresh() }
    const row = (content, fn, title) => el('button', { role: 'menuitem', tabindex: -1, title, onclick: (e) => { e.stopPropagation(); closeMenu(); fn() } }, content)

    const folderMenu = (anchor, f) => {
      const rows = f.items.map((i) => el('div', { class: 'pb-it' },
        row((i.live ? '● ' : '') + short(i.t, 40), () => act('focusOrOpen', { url: i.u })),
        f.ro ? null : row(ic('close', 'Aus Ordner entfernen'), () => lf('unassign', i.u), 'Aus Ordner entfernen')))
      if (!rows.length) rows.push(el('div', { class: 'pb-dim' }, 'Leer'))
      rows.push(el('hr'))
      if (f.items.length) rows.push(row('Alle öffnen', async () => { for (const i of f.items) await act('focusOrOpen', { url: i.u, background: true }) }))
      if (f.items.length && data.groups) rows.push(row('Als Tab-Gruppe öffnen', () => act('folderGroup', { id: f.id })))
      if (!f.ro) {
        rows.push(row('Tab hinzufügen ▸', () => {
          const free = data.tabs.filter((t) => !f.items.some((i) => i.u === t.u)).slice(0, 15)
          showMenu(anchor, free.length ? free.map((t) => row(short(t.t || t.u, 40), () => lf('assign', f.id, t.u, t.t))) : [el('div', { class: 'pb-dim' }, 'Keine offenen Tabs')])
        }))
        rows.push(row('Als Sitzung speichern', () => act('folderSession', { id: f.id })))
        rows.push(row('Umbenennen …', () => { const n = prompt('Name', f.name); if (n) lf('rename', f.id, n) }))
        rows.push(row('Symbol …', () => symbolMenu(anchor, f)))
        rows.push(row('Ordner löschen', () => { if (confirm(`„${f.name}“ löschen? Die Tabs bleiben offen.`)) lf('remove', f.id) }))
      }
      showMenu(anchor, rows)
    }
    // Symbol-Auswahl: Raster aus 24 Emoji plus eigenes Zeichen.
    const symbolMenu = (anchor, f) => showMenu(anchor, [
      el('div', { class: 'pb-grid' }, (globalThis.PikaIcons?.EMOJI || []).map((em) => row(em, () => lf('rename', f.id, '', em), 'Symbol ' + em))),
      row('Eigenes Zeichen …', () => { const n = prompt('Symbol', f.icon); if (n) lf('rename', f.id, '', n.trim().slice(0, 4)) })])
    // Link auf einen eigenen Live-Ordner ziehen = zuordnen (Lesezeichen-Ordner sind schreibgeschützt).
    const titleOf = (u, dt) => { const t = dt.getData('text/plain').trim(); return (t && t !== u ? t : [...data.tabs, ...data.bm, ...data.quick].find((x) => x.u === u)?.t || u).slice(0, 200) }
    const dropProps = (f) => f.ro ? {} : {
      ondragover: (e) => { e.preventDefault(); e.currentTarget.classList.add('pb-drop') },
      ondragleave: (e) => e.currentTarget.classList.remove('pb-drop'),
      ondrop: (e) => { e.preventDefault(); e.currentTarget.classList.remove('pb-drop'); const u = urlFromDrop(e.dataTransfer); if (u) lf('assign', f.id, u, titleOf(u, e.dataTransfer)) },
    }
    const nodeFor = (en) => en.f
      ? el('button', { title: en.f.name, onclick: (e) => { e.stopPropagation(); folderMenu(e.currentTarget, en.f) }, ...dropProps(en.f) }, en.f.icon, short(en.f.name, 16), en.f.items.some((i) => i.live) ? el('span', { class: 'pb-live' }, '●' + en.f.items.filter((i) => i.live).length) : null)
      : el('a', { href: en.u, title: en.u, onclick: (e) => { e.preventDefault(); act('open', { url: en.u }) }, onauxclick: (e) => { e.preventDefault(); act('open', { url: en.u, newTab: true }) } }, short(en.t))

    function draw() {
      const entries = [...data.folders.map((f) => ({ f })), { sep: true }, ...data.bm, { sep: true }, ...data.quick].filter((e, i, a) => !e.sep || (i > 0 && !a[i - 1].sep && i < a.length - 1))
      const nodes = entries.map((en) => (en.sep ? el('span', { class: 'pb-sep' }) : nodeFor(en)))
      list.replaceChildren(...nodes)
      const ctl = [
        el('button', { title: 'Neuer Live-Ordner', 'aria-label': 'Neuer Live-Ordner', onclick: () => { const n = prompt('Name des Live-Ordners'); if (n) lf('add', n) } }, ic('plus')),
        el('button', { title: 'Tabs mit KI sortieren', 'aria-label': 'Tabs mit KI sortieren', onclick: () => act('openAi') }, ic('ai')),
        opts.onCollapse ? el('button', { title: 'Leiste einklappen', 'aria-label': 'Leiste einklappen', onclick: opts.onCollapse }, ic('up')) : null,
      ]
      bar.replaceChildren(list, ...ctl.filter(Boolean))
      if (opts.vertical) return // senkrecht (Seitenleiste): kein Überlauf, die Liste scrollt
      const widths = nodes.map((n) => n.offsetWidth)
      const keep = splitOverflow(widths, list.clientWidth)
      if (keep < nodes.length) {
        const more = el('button', { title: 'Mehr', 'aria-label': 'Mehr' }, ic('more'))
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
  globalThis.PikaBar = { mount, splitOverflow, urlFromDrop, nextIndex }
})()