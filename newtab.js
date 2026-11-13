import { B } from './lib/api.js'
import { load, save } from './lib/store.js'
import { h, toast, menu, dialog, ask, tile } from './lib/ui.js'
import { domainOf, groupHistory, renameName, parseAiTopics, score, parseBars, barsToText } from './lib/logic.js'
import { loadItems } from './lib/dials.js'
import { treeToFolders, importFolders, barOf } from './lib/seed.js'
import { saveBackup, listBackups, makeBackup, restore } from './lib/backup.js'
import { openTabs, saveSession, openSession } from './lib/sessions.js'
import * as ai from './lib/ai.js'
import * as ollama from './lib/ollama.js'
import { resumeCards } from './lib/resume.js'

let S, T, histItems = [], filterTag = '', selMode = false, focus = null, drag = null, importing = false
const byId = new Map()
const sel = new Set()
const $ = (id) => document.getElementById(id)
const persist = () => save(S)
const ws = () => S.workspaces.find((w) => w.id === S.currentWs) || S.workspaces[0]
const mk = (n) => n.url || 'f:' + n.id
const mt = (k) => (S.meta[k] ||= {})
const go = (url) => { location.href = url }
const btn = (t, title, fn) => h('button', { class: 'ico', title, onclick: fn }, t)
const COLORS = [['', 'Keine'], ['#ef4444', 'Rot'], ['#f97316', 'Orange'], ['#eab308', 'Gelb'], ['#22c55e', 'Grün'], ['#3b82f6', 'Blau'], ['#a855f7', 'Violett']]
const PRESETS = {
  aurora: 'radial-gradient(60% 50% at 20% 20%,#7c3aed,transparent),radial-gradient(50% 50% at 80% 30%,#06b6d4,transparent),radial-gradient(60% 60% at 50% 90%,#10b981,transparent)',
  sunset: 'linear-gradient(160deg,#f97316,#db2777 55%,#4c1d95)',
  ocean: 'linear-gradient(180deg,#0ea5e9,#1e3a8a)',
  forest: 'linear-gradient(160deg,#166534,#052e16)',
  dots: 'radial-gradient(currentColor 1px,transparent 1px) 0 0/18px 18px',
  grid: 'linear-gradient(currentColor 1px,transparent 1px) 0 0/32px 32px,linear-gradient(90deg,currentColor 1px,transparent 1px) 0 0/32px 32px',
  mono: 'linear-gradient(135deg,#27272a,#09090b)',
  candy: 'conic-gradient(from 200deg at 30% 30%,#f472b6,#a78bfa,#60a5fa,#34d399,#f472b6)',
}

/* ---------- Daten ---------- */
function index() { byId.clear(); (function w(n) { byId.set(n.id, n); n.children?.forEach(w) })(T[0]) }
let reloadT
function reloadSoon() {
  if (importing) return
  clearTimeout(reloadT)
  reloadT = setTimeout(async () => { T = await B.bookmarks.getTree(); index(); renderBoard() }, 300)
}
const countUrls = (n) => n.url ? 1 : (n.children || []).reduce((a, c) => a + countUrls(c), 0)
function urlsOf(n) { return n.url ? [n] : (n.children || []).flatMap(urlsOf) }
function allFolders() {
  const out = []
  ;(function w(n, path) { for (const c of n.children || []) if (!c.url) { const p = [...path, c.title || c.id]; out.push({ node: c, label: p.join(' / ') }); w(c, p) } })(T[0], [])
  return out
}
function columnsFor(w) {
  if (w.folders?.length) return w.folders.map((id) => byId.get(id)).filter(Boolean)
  const bar = barOf(T), cols = []
  const loose = (bar.children || []).filter((c) => c.url)
  if (loose.length) cols.push({ id: 'virtual', title: 'Leiste', children: loose, virtual: true })
  cols.push(...(bar.children || []).filter((c) => !c.url))
  for (const r of T[0].children) if (r !== bar && r.children?.length) cols.push(r)
  return cols
}
function passes(n) {
  if (n.url) return !filterTag || (S.meta[n.url]?.tags || []).includes(filterTag)
  return !filterTag || (n.children || []).some(passes)
}
const patch = async (nodes, fn) => { nodes.forEach((n) => fn(mt(mk(n)))); await persist(); renderBoard() }

/* ---------- Aussehen ---------- */
async function applyLook() {
  const s = S.settings, r = document.documentElement, bg = s.bg, el = $('bg')
  const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  r.dataset.theme = dark ? 'dark' : 'light'
  r.toggleAttribute('data-pitch', !!(dark && s.pitch))
  r.style.setProperty('--accent', s.accent)
  el.style.opacity = bg.type === 'none' ? 0 : bg.intensity / 100
  if (bg.type === 'preset') el.style.background = PRESETS[bg.preset]
  else if (bg.type === 'color') el.style.background = bg.c1
  else if (bg.type === 'gradient') el.style.background = `linear-gradient(135deg,${bg.c1},${bg.c2})`
  else if (bg.type === 'photo') {
    const { pika_photo } = await B.storage.local.get('pika_photo')
    el.style.background = pika_photo ? `center/cover url("${pika_photo}")` : ''
  }
  $('grain').style.opacity = (bg.grain / 100) * 0.6
}
addEventListener('mousemove', (e) => {
  if (S?.settings.bg.parallax) $('bg').style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -20}px,${(e.clientY / innerHeight - 0.5) * -20}px)`
})

/* ---------- Kopfzeile, Pins, Tags ---------- */
function renderHead() {
  const wsSel = h('select', { onchange: async (e) => { S.currentWs = e.target.value; focus = null; await persist(); render() } },
    S.workspaces.map((w) => h('option', { value: w.id, selected: w.id === S.currentWs }, w.name)))
  $('top').replaceChildren(h('b', { class: 'logo' }, 'pika-own'), wsSel,
    btn('＋', 'Workspace anlegen', newWs), btn('✎', 'Workspace bearbeiten', editWs),
    h('button', { class: 'search', onclick: palette }, 'Suchen … (F)'),
    btn('☑', 'Auswahlmodus (S)', toggleSel), btn('▦', 'Board / Galerie (V)', toggleView),
    btn('⏱', 'Tab-Sitzungen', sessionsDlg), btn('✨', 'KI', aiDlg), btn('▣', 'Widget hinzufügen', addWidget), btn('⚙', 'Einstellungen', settingsDlg))
}
function renderPinned() {
  $('pinned').replaceChildren(...ws().pinned.map((p) => h('a', {
    class: 'chip', href: p.url, title: p.url,
    oncontextmenu: (e) => { e.preventDefault(); menu(e, [{ label: 'Pin entfernen', fn: async () => { ws().pinned = ws().pinned.filter((x) => x.url !== p.url); await persist(); renderPinned() } }]) },
  }, tile(domainOf(p.url), S.settings.favicons), p.title)))
}
async function togglePin(url, title) {
  const w = ws()
  w.pinned = w.pinned.some((p) => p.url === url) ? w.pinned.filter((p) => p.url !== url) : [...w.pinned, { url, title: title || domainOf(url) }]
  await persist(); renderPinned()
}
function renderTags() {
  $('tags').replaceChildren(...Object.keys(S.tags).map((t) => h('button', {
    class: 'tagchip' + (filterTag === t ? ' on' : ''), style: { '--c': S.tags[t] },
    onclick: () => { filterTag = filterTag === t ? '' : t; renderTags(); renderBoard() },
    oncontextmenu: (e) => { e.preventDefault(); tagMenu(e, t) },
  }, '#' + t)))
}
function tagMenu(e, t) {
  menu(e, [
    { label: 'Umbenennen / Farbe …', fn: async () => {
      const v = await ask('Tag', [{ name: 'name', label: 'Name', value: t }, { name: 'color', label: 'Farbe', type: 'color', value: S.tags[t] }])
      if (!v || !v.name.trim()) return
      const n = v.name.trim()
      delete S.tags[t]; S.tags[n] = v.color
      for (const m of Object.values(S.meta)) if (m.tags?.includes(t)) m.tags = [...new Set(m.tags.map((x) => (x === t ? n : x)))]
      if (filterTag === t) filterTag = n
      await persist(); render()
    } },
    { label: 'Tag löschen', fn: async () => {
      delete S.tags[t]
      for (const m of Object.values(S.meta)) if (m.tags) m.tags = m.tags.filter((x) => x !== t)
      if (filterTag === t) filterTag = ''
      await persist(); render()
    } },
  ])
}

/* ---------- Schnellwahl-Leisten aus dem Verlauf ---------- */
function renderBars() {
  const s = S.settings
  $('bars').replaceChildren(...s.bars.map((bar) => {
    const g = groupHistory(histItems, { mode: bar.mode, filter: bar.filter, limit: bar.limit, now: Date.now(), hidden: s.hidden })
    if (!g.length) return null
    return h('div', { class: 'bar' }, h('div', { class: 'barname' }, bar.name), h('div', { class: 'dials' }, g.map(dialEl)))
  }).filter(Boolean))
}
/* ---------- Weitermachen: Verlauf -> Sitzungs-Karten ---------- */
function renderResume() {
  const cards = resumeCards(histItems)
  $('resume').replaceChildren(...(cards.length ? [h('div', { class: 'barname' }, 'Weitermachen'), h('div', { class: 'cards' }, cards.map((c) => h('div', { class: 'card' },
    h('b', {}, c.title), h('span', { class: 'muted' }, ` ${new Date(c.end).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · ${c.items.length} Seiten`),
    h('ul', {}, c.items.slice(0, 3).map((i) => h('li', {}, i.title.slice(0, 50)))),
    h('button', { onclick: () => B.windows.create({ url: c.items.map((i) => i.url) }) }, 'Alle öffnen'))))] : []))
}
const dialEl = (g) => h('a', {
  class: 'dial', href: 'https://' + g.domain + '/', title: `${g.domain} · ${g.visits} Besuche`,
  oncontextmenu: (e) => { e.preventDefault(); dialMenu(e, g) },
}, tile(g.domain, S.settings.favicons), h('span', {}, g.domain))
function dialMenu(e, g) {
  menu(e, [
    { label: g.domain + ' öffnen', fn: () => go('https://' + g.domain + '/') },
    { sep: 1 },
    ...g.subs.slice(0, 10).map((s) => ({ label: `${(s.title || s.url).slice(0, 60)}  ·${s.visits}`, fn: () => go(s.url) })),
    { sep: 1 },
    { label: 'Anpinnen', fn: () => togglePin('https://' + g.domain + '/', g.domain) },
    { label: 'Als Lesezeichen speichern', fn: () => B.bookmarks.create({ title: g.domain, url: 'https://' + g.domain + '/' }).then(() => toast('Gespeichert')) },
    { label: 'Aus Schnellwahl ausblenden', fn: async () => { S.settings.hidden.push(g.domain); await persist(); renderBars() } },
  ])
}

/* ---------- Widgets ---------- */
let ticks = []
setInterval(() => ticks.forEach((f) => f()), 1000)
function renderWidgets() {
  ticks = []
  $('widgets').replaceChildren(...ws().widgets.map(widgetEl))
}
function widgetEl(w) {
  const big = h('div', { class: 'wbig' }), sub = h('div', { class: 'muted' })
  const title = { clock: w.tz || 'Lokale Zeit', countdown: w.label || 'Countdown', timer: 'Timer ' + w.minutes + ' min', counter: w.label || 'Zähler', snippets: 'Textbausteine' }[w.type]
  const box = h('div', { class: 'widget', oncontextmenu: (e) => { e.preventDefault(); menu(e, [{ label: 'Widget entfernen', fn: async () => { ws().widgets = ws().widgets.filter((x) => x.id !== w.id); await persist(); renderWidgets() } }]) } }, h('div', { class: 'wtitle' }, title), big, sub)
  if (w.type === 'clock') {
    ticks.push(() => {
      try {
        const d = new Date(), tz = w.tz || undefined
        big.textContent = d.toLocaleTimeString('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        sub.textContent = d.toLocaleDateString('de-DE', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short' })
      } catch { big.textContent = 'Zeitzone?' }
    })
  } else if (w.type === 'countdown') {
    ticks.push(() => {
      const s = Math.max(0, Math.floor((new Date(w.to) - Date.now()) / 1000))
      big.textContent = `${Math.floor(s / 86400)}d ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      sub.textContent = new Date(w.to).toLocaleString('de-DE')
    })
  } else if (w.type === 'timer') {
    let left = w.minutes * 60, run = false
    const show = () => { big.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}` }
    show()
    ticks.push(() => { if (run && left > 0 && --left === 0) { run = false; toast('Timer abgelaufen: ' + w.minutes + ' min') } if (run) show() })
    box.append(h('button', { onclick: () => { run = !run } }, 'Start/Pause'), h('button', { onclick: () => { run = false; left = w.minutes * 60; show() } }, 'Reset'))
  } else if (w.type === 'counter') {
    const upd = () => { big.textContent = w.n }
    upd()
    const step = (d) => async () => { w.n += d; upd(); await persist() }
    box.append(h('button', { onclick: step(-1) }, '−'), h('button', { onclick: step(1) }, '+'))
  } else if (w.type === 'snippets') {
    box.append(...w.items.map((t) => h('button', { onclick: () => { navigator.clipboard.writeText(t); toast('Kopiert') } }, t.slice(0, 28))),
      h('button', { onclick: async () => { const v = await ask('Textbausteine', [{ name: 'items', label: 'Einer pro Zeile', type: 'textarea', rows: 6, value: w.items.join('\n') }]); if (v) { w.items = v.items.split('\n').map((x) => x.trim()).filter(Boolean); await persist(); renderWidgets() } } }, '✎'))
  }
  return box
}
async function addWidget() {
  const t = await ask('Widget', [{ name: 'type', label: 'Typ', type: 'select', options: [['clock', 'Datum & Uhrzeit (Zeitzone)'], ['countdown', 'Countdown'], ['timer', 'Timer'], ['counter', 'Zähler'], ['snippets', 'Textbausteine']] }])
  if (!t) return
  const F = {
    clock: [{ name: 'tz', label: 'Zeitzone (leer = lokal)', placeholder: 'Asia/Tokyo' }],
    countdown: [{ name: 'label', label: 'Name' }, { name: 'to', label: 'Ziel', type: 'datetime-local' }],
    timer: [{ name: 'minutes', label: 'Minuten', type: 'number', value: 25, min: 1 }],
    counter: [{ name: 'label', label: 'Name' }],
    snippets: [{ name: 'items', label: 'Einer pro Zeile', type: 'textarea', rows: 5 }],
  }[t.type]
  const v = await ask('Widget: ' + t.type, F)
  if (!v) return
  const w = { id: crypto.randomUUID(), type: t.type }
  if (t.type === 'clock') { try { if (v.tz) new Intl.DateTimeFormat('de', { timeZone: v.tz }) } catch { return toast('Unbekannte Zeitzone: ' + v.tz) } w.tz = v.tz.trim() }
  if (t.type === 'countdown') { if (!v.to) return toast('Ziel fehlt'); w.label = v.label; w.to = v.to }
  if (t.type === 'timer') w.minutes = Math.max(1, v.minutes || 25)
  if (t.type === 'counter') { w.label = v.label; w.n = 0 }
  if (t.type === 'snippets') w.items = v.items.split('\n').map((x) => x.trim()).filter(Boolean)
  ws().widgets.push(w); await persist(); renderWidgets()
}

/* ---------- Board ---------- */
function iconEl(n, m) {
  return m.icon ? h('span', { class: 'emoji' }, m.icon) : tile(domainOf(n.url), S.settings.favicons)
}
function itemEl(n) {
  const m = S.meta[n.url] || {}
  const cb = selMode ? h('input', { type: 'checkbox', checked: sel.has(n.id) }) : null
  const a = h('a', {
    class: 'item' + (sel.has(n.id) ? ' sel' : ''), href: n.url, draggable: true, title: n.url, style: { '--lc': m.color || 'transparent' },
    onclick: (e) => { if (selMode) { e.preventDefault(); sel.has(n.id) ? sel.delete(n.id) : sel.add(n.id); a.classList.toggle('sel'); if (cb) cb.checked = sel.has(n.id); renderSelBar() } },
    oncontextmenu: (e) => { e.preventDefault(); itemMenu(e, n) },
    ondragstart: () => { drag = n.id }, ondragover: (e) => e.preventDefault(),
    ondrop: (e) => { e.preventDefault(); e.stopPropagation(); dropOn(n.parentId, n.index) },
  }, cb, iconEl(n, m), h('span', { class: 't' }, n.title || n.url), m.fav ? '★' : null,
    m.comment ? h('span', { title: m.comment }, '📝') : null,
    m.remind ? h('span', { title: new Date(m.remind).toLocaleString('de-DE') }, '⏰') : null,
    (m.tags || []).map((t) => h('span', { class: 'tag', style: { background: S.tags[t] || '#888' } }, t)))
  return a
}
function folderEl(n) {
  const d = h('details', { class: 'sub', open: S.open[n.id] ?? true },
    h('summary', { oncontextmenu: (e) => { e.preventDefault(); colMenu(e, n, true) }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); e.stopPropagation(); dropOn(n.id) } },
      h('span', {}, '📁 ' + (n.title || 'Ordner')), h('span', { class: 'muted' }, ' ' + countUrls(n))),
    h('div', { class: 'subbody' }, (n.children || []).filter(passes).map((c) => (c.url ? itemEl(c) : folderEl(c)))))
  d.addEventListener('toggle', () => { if (d.open !== (S.open[n.id] ?? true)) { S.open[n.id] = d.open; persist() } })
  return d
}
function colEl(f) {
  const cm = ws().colNames[f.id] || {}
  return h('section', {
    class: 'col', style: { '--c': cm.color || 'var(--bd)' }, ondragover: (e) => e.preventDefault(),
    ondrop: (e) => { e.preventDefault(); if (!f.virtual) dropOn(f.id) },
  }, h('header', { class: 'colhead' }, h('span', { class: 'colname' }, cm.name || f.title || '(ohne Namen)'), h('span', { class: 'muted' }, String(countUrls(f))), h('button', { class: 'ico', onclick: (e) => colMenu(e, f) }, '⋯')),
  h('div', { class: 'colbody' }, (f.children || []).filter(passes).map((n) => (n.url ? itemEl(n) : folderEl(n)))))
}
function renderBoard() {
  const b = $('board')
  b.classList.toggle('gallery', S.settings.view === 'gallery')
  const cols = focus ? [byId.get(focus)].filter(Boolean) : columnsFor(ws())
  b.replaceChildren(...[focus ? h('button', { onclick: () => { focus = null; renderBoard() } }, '← Alle Spalten') : null, ...cols.map(colEl),
    cols.length ? null : h('p', { class: 'muted' }, 'Keine Lesezeichen. Einstellungen → „Seed importieren“ oder Lesezeichen anlegen.')].filter(Boolean))
  renderSelBar()
}
async function dropOn(parentId, index) {
  const id = drag; drag = null
  if (!id || id === parentId) return
  try { await B.bookmarks.move(id, index == null ? { parentId } : { parentId, index }) } catch (e) { toast(e.message) }
}
function openAll(n) {
  const u = urlsOf(n)
  if (u.length > 15 && !confirm(`${u.length} Tabs öffnen?`)) return
  u.forEach((x) => B.tabs.create({ url: x.url, active: false }))
}

/* ---------- Menüs & Dialoge zu Einträgen ---------- */
function itemMenu(e, n) {
  const m = S.meta[mk(n)] || {}
  const targets = sel.size && sel.has(n.id) ? [...sel].map((id) => byId.get(id)).filter(Boolean) : [n]
  menu(e, [
    n.url ? { label: 'In neuem Tab öffnen', fn: () => B.tabs.create({ url: n.url }) } : { label: 'Alle öffnen', fn: () => openAll(n) },
    { label: m.fav ? '★ Favorit entfernen' : '☆ Favorit', fn: () => patch(targets, (x) => { x.fav = !m.fav }) },
    n.url && { label: ws().pinned.some((p) => p.url === n.url) ? 'Pin entfernen' : 'Anpinnen', fn: () => togglePin(n.url, n.title) },
    { sep: 1 },
    { label: 'Tags …', fn: () => tagsDlg(targets) },
    { label: 'Kommentar …', fn: () => commentDlg(n) },
    { label: 'Erinnerung …', fn: () => remindDlg(n) },
    { label: 'Icon (Emoji) …', fn: () => iconDlg(n) },
    { label: 'Farbmarkierung …', fn: () => colorDlg(targets) },
    { sep: 1 },
    { label: 'Umbenennen …', fn: () => renameOne(n) },
    { label: targets.length > 1 ? `Sammelumbenennen (${targets.length}) …` : 'Sammelumbenennen …', fn: () => bulkRename(targets) },
    { label: 'Löschen', fn: () => del(targets) },
  ])
}
function colMenu(e, f, isSub) {
  const real = !f.virtual
  menu(e, [
    { label: 'Alle öffnen', fn: () => openAll(f) },
    !isSub && real && { label: 'Spaltenname & Farbe …', fn: async () => {
      const cm = ws().colNames[f.id] || {}
      const v = await ask('Spalte', [{ name: 'name', label: 'Name', value: cm.name || f.title }, { name: 'color', label: 'Farbe', type: 'color', value: cm.color || '#6366f1' }, { name: 'reset', label: 'Zurücksetzen', type: 'checkbox' }])
      if (!v) return
      if (v.reset) delete ws().colNames[f.id]; else ws().colNames[f.id] = { name: v.name, color: v.color }
      await persist(); renderBoard()
    } },
    { label: 'Nur diesen Ordner zeigen', fn: () => { focus = f.id; renderBoard() } },
    { label: 'Inhalt sammelumbenennen …', fn: () => bulkRename(f.children || []) },
    real && { label: 'Ordner umbenennen …', fn: () => renameOne(f) },
    !isSub && ws().folders.includes(f.id) && { label: 'Aus Workspace entfernen', fn: async () => { ws().folders = ws().folders.filter((x) => x !== f.id); await persist(); renderBoard() } },
    real && { label: 'Ordner löschen', fn: () => del([f]) },
  ])
}
async function tagsDlg(targets) {
  const names = Object.keys(S.tags)
  const has = (t) => targets.every((x) => (S.meta[mk(x)]?.tags || []).includes(t))
  const v = await ask('Tags', [
    ...names.map((t) => ({ name: 't:' + t, label: '#' + t, type: 'checkbox', value: has(t) })),
    { name: 'new', label: 'Neue Tags (Komma)', placeholder: 'lesen, später' }, { name: 'color', label: 'Farbe neuer Tags', type: 'color', value: '#6366f1' }])
  if (!v) return
  const add = new Set(names.filter((t) => v['t:' + t]))
  const remove = names.filter((t) => !v['t:' + t] && has(t))
  for (const nt of v.new.split(',').map((s) => s.trim()).filter(Boolean)) { S.tags[nt] ??= v.color; add.add(nt) }
  for (const x of targets) { const m = mt(mk(x)); m.tags = [...new Set([...(m.tags || []).filter((t) => !remove.includes(t)), ...add])] }
  await persist(); render()
}
async function commentDlg(n) {
  const v = await ask('Kommentar', [{ name: 'c', label: n.title || 'Eintrag', type: 'textarea', value: S.meta[mk(n)]?.comment || '' }])
  if (!v) return
  const m = mt(mk(n)); v.c.trim() ? (m.comment = v.c.trim()) : delete m.comment
  await persist(); renderBoard()
}
async function remindDlg(n) {
  const pad = (x) => String(x).padStart(2, '0'), d = new Date(Date.now() + 36e5)
  const def = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  const v = await ask('Erinnerung', [{ name: 'when', label: 'Wann', type: 'datetime-local', value: def }, { name: 'off', label: 'Erinnerung entfernen', type: 'checkbox' }])
  if (!v) return
  const m = mt(mk(n))
  if (v.off || !v.when) delete m.remind; else m.remind = new Date(v.when).getTime()
  await persist(); renderBoard()
}
async function iconDlg(n) {
  const v = await ask('Icon', [{ name: 'i', label: 'Emoji (leer = Standard)', value: S.meta[mk(n)]?.icon || '' }])
  if (!v) return
  const m = mt(mk(n)); v.i.trim() ? (m.icon = [...v.i.trim()].slice(0, 2).join('')) : delete m.icon
  await persist(); renderBoard()
}
async function colorDlg(targets) {
  const v = await ask('Farbmarkierung', [{ name: 'c', label: 'Farbe', type: 'select', options: COLORS }])
  if (v) patch(targets, (m) => { v.c ? (m.color = v.c) : delete m.color })
}
async function renameOne(n) {
  const v = await ask('Umbenennen', [{ name: 't', label: 'Titel', value: n.title }])
  if (v) await B.bookmarks.update(n.id, { title: v.t })
}
async function del(nodes) {
  if (!confirm(`${nodes.length} Eintrag/Einträge löschen? (Ordner mit Inhalt)`)) return
  for (const n of nodes) { try { n.url ? await B.bookmarks.remove(n.id) : await B.bookmarks.removeTree(n.id) } catch (e) { toast(e.message) } }
  sel.clear()
}
function bulkRename(nodes) {
  if (!nodes.length) return toast('Nichts ausgewählt')
  const f = {
    find: h('input', { placeholder: 'Suchen' }), rep: h('input', { placeholder: 'Ersetzen durch' }), re: h('input', { type: 'checkbox' }),
    cs: h('select', {}, [['none', 'Groß/Klein unverändert'], ['upper', 'GROSS'], ['lower', 'klein'], ['title', 'Titel-Schreibung']].map(([v, l]) => h('option', { value: v }, l))),
  }
  const prev = h('div', { class: 'prev' })
  let plan = []
  const upd = () => {
    try {
      plan = nodes.map((n) => ({ n, to: renameName(n.title || '', { find: f.find.value, replace: f.rep.value, regex: f.re.checked, caseMode: f.cs.value }) })).filter((p) => p.to !== (p.n.title || ''))
      prev.replaceChildren(h('b', {}, `${plan.length} von ${nodes.length} ändern sich`), ...plan.slice(0, 50).map((p) => h('div', {}, `${p.n.title}  →  ${p.to}`)))
    } catch (e) { plan = []; prev.textContent = 'Ungültiger Ausdruck: ' + e.message }
  }
  Object.values(f).forEach((i) => i.addEventListener('input', upd))
  const body = h('div', {}, h('label', { class: 'row' }, h('span', {}, 'Suchen'), f.find), h('label', { class: 'row' }, h('span', {}, 'Ersetzen'), f.rep), h('label', { class: 'row' }, h('span', {}, 'Regex'), f.re), h('label', { class: 'row' }, h('span', {}, 'Schreibung'), f.cs), prev)
  upd()
  dialog(`Sammelumbenennen (${nodes.length})`, body, [{ label: 'Abbrechen' }, { label: 'Anwenden', primary: true, fn: async () => {
    if (!plan.length) return false
    for (const p of plan) await B.bookmarks.update(p.n.id, { title: p.to })
    toast(plan.length + ' umbenannt')
  } }])
}

/* ---------- Auswahlmodus, Ansicht ---------- */
function toggleSel() { selMode = !selMode; sel.clear(); renderBoard() }
function toggleView() { S.settings.view = S.settings.view === 'board' ? 'gallery' : 'board'; persist(); renderBoard() }
function renderSelBar() {
  const bar = $('selbar')
  bar.hidden = !selMode
  if (!selMode) return
  const nodes = () => [...sel].map((id) => byId.get(id)).filter(Boolean)
  bar.replaceChildren(h('b', {}, sel.size + ' ausgewählt'),
    h('button', { onclick: () => tagsDlg(nodes()) }, 'Tags'),
    h('button', { onclick: () => patch(nodes(), (m) => { m.fav = true }) }, '★'),
    h('button', { onclick: () => colorDlg(nodes()) }, 'Farbe'),
    h('button', { onclick: () => bulkRename(nodes()) }, 'Umbenennen'),
    h('button', { onclick: () => { navigator.clipboard.writeText(nodes().map((n) => n.url).join('\n')); toast('Links kopiert') } }, 'Links kopieren'),
    h('button', { onclick: () => del(nodes()) }, 'Löschen'),
    h('button', { onclick: toggleSel }, 'Fertig'))
}

/* ---------- Befehlspalette ---------- */
function palette() {
  const ACTIONS = [
    ['Auswahlmodus', toggleSel], ['Board / Galerie wechseln', toggleView], ['KI: Tabs nach Themen', aiDlg], ['Tab-Sitzungen', sessionsDlg],
    ['Einstellungen', settingsDlg], ['Neuer Workspace', newWs], ['Widget hinzufügen', addWidget],
    ['Sicherung jetzt erstellen', async () => { await saveBackup(); toast('Gesichert') }], ['Tag-Filter aufheben', () => { filterTag = ''; render() }],
  ]
  const urls = urlsOf(T[0])
  const input = h('input', { placeholder: 'Suchen …   > Aktion   / Ordner   @ Workspace   # Tag' })
  const list = h('div', { class: 'plist' })
  let rows = [], idx = 0
  const dlg = h('dialog', { class: 'dlg pal' }, input, list)
  const draw = () => list.replaceChildren(...rows.slice(0, 40).map((r, i) => h('div', { class: i === idx ? 'on' : '', onclick: () => run(r) }, h('span', {}, r.label), h('span', { class: 'muted' }, r.sub || ''))))
  const run = (r, ctrl) => { dlg.close(); r.fn(ctrl) }
  const compute = () => {
    const q = input.value, c = q[0], rest = q.slice(1).trim()
    if (c === '>') rows = ACTIONS.filter(([l]) => score(rest, l)).map(([label, fn]) => ({ label, fn }))
    else if (c === '/') rows = allFolders().filter((f) => score(rest, f.label)).map((f) => ({ label: f.label, sub: countUrls(f.node) + '', fn: () => { focus = f.node.id; renderBoard() } }))
    else if (c === '@') rows = S.workspaces.filter((w) => score(rest, w.name)).map((w) => ({ label: w.name, sub: 'Workspace', fn: async () => { S.currentWs = w.id; focus = null; await persist(); render() } }))
    else if (c === '#') rows = Object.keys(S.tags).filter((t) => score(rest, t)).map((t) => ({ label: '#' + t, sub: 'Tag-Filter', fn: () => { filterTag = t; renderTags(); renderBoard() } }))
    else rows = urls.map((n) => ({ n, s: score(q, `${n.title} ${n.url} ${(S.meta[n.url]?.tags || []).join(' ')}`) })).filter((x) => x.s).sort((a, b) => b.s - a.s).slice(0, 40)
      .map(({ n }) => ({ label: n.title || n.url, sub: domainOf(n.url), fn: (ctrl) => (ctrl ? B.tabs.create({ url: n.url }) : go(n.url)) }))
    idx = 0; draw()
  }
  input.addEventListener('input', compute)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { idx = Math.min(idx + 1, rows.length - 1); draw(); e.preventDefault() }
    else if (e.key === 'ArrowUp') { idx = Math.max(idx - 1, 0); draw(); e.preventDefault() }
    else if (e.key === 'Enter' && rows[idx]) run(rows[idx], e.ctrlKey || e.metaKey)
  })
  dlg.addEventListener('close', () => dlg.remove())
  document.body.append(dlg); dlg.showModal(); compute(); input.focus()
}
addEventListener('keydown', (e) => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey) return
  const k = e.key.toLowerCase()
  if (k === 'f') { e.preventDefault(); palette() }
  else if (k === 's') toggleSel()
  else if (k === 'v') toggleView()
  else if (k === 'n') newWs()
  else if (k === '?') toast('F Suche · S Auswahl · V Ansicht · N Workspace · Rechtsklick: Menüs')
  else if (k === 'escape') { if (selMode) toggleSel(); else if (focus) { focus = null; renderBoard() } else if (filterTag) { filterTag = ''; renderTags(); renderBoard() } }
})

/* ---------- Workspaces ---------- */
async function newWs() {
  const v = await ask('Neuer Workspace', [{ name: 'n', label: 'Name' }])
  if (!v || !v.n.trim()) return
  const w = { id: crypto.randomUUID(), name: v.n.trim(), folders: [], pinned: [], colNames: {}, widgets: [] }
  S.workspaces.push(w); S.currentWs = w.id; focus = null
  await persist(); render()
}
async function editWs() {
  const w = ws()
  let picked = [...w.folders]
  const pickBtn = h('button', { type: 'button', onclick: async () => {
    const list = allFolders()
    const boxes = list.map((f) => h('label', { class: 'row' }, h('span', {}, f.label), h('input', { type: 'checkbox', checked: picked.includes(f.node.id), 'data-id': f.node.id })))
    dialog('Spalten dieses Workspace (nichts gewählt = Standard)', h('div', {}, boxes), [{ label: 'Abbrechen' }, { label: 'Übernehmen', primary: true, fn: () => { picked = boxes.map((b) => b.querySelector('input')).filter((i) => i.checked).map((i) => i.dataset.id) } }])
  } }, 'Spalten wählen …')
  const v = await ask('Workspace', [{ name: 'n', label: 'Name', value: w.name }, ...(S.workspaces.length > 1 ? [{ name: 'del', label: 'Workspace löschen', type: 'checkbox' }] : [])], { extra: pickBtn })
  if (!v) return
  if (v.del) { S.workspaces = S.workspaces.filter((x) => x.id !== w.id); S.currentWs = S.workspaces[0].id } else { w.name = v.n.trim() || w.name; w.folders = picked }
  focus = null
  await persist(); render()
}

/* ---------- Sitzungen ---------- */
function sessionsDlg() {
  const body = h('div', { class: 'list' })
  const draw = () => body.replaceChildren(...(S.sessions.length ? S.sessions.map((s) => h('div', { class: 'lrow' },
    h('span', {}, `${s.name} · ${s.tabs.length} Tabs · ${new Date(s.ts).toLocaleString('de-DE')}`),
    h('button', { onclick: () => openSession(s) }, 'Öffnen'),
    h('button', { onclick: async () => { S.sessions = S.sessions.filter((x) => x !== s); await persist(); draw() } }, '✕'))) : [h('p', { class: 'muted' }, 'Noch keine Sitzungen.')]))
  draw()
  dialog('Tab-Sitzungen', body, [{ label: 'Aktuelle Tabs speichern', primary: true, fn: async () => {
    const v = await ask('Name der Sitzung', [{ name: 'n', label: 'Name', value: new Date().toLocaleString('de-DE') }])
    if (v) { await saveSession(S, v.n); await persist(); draw() }
    return false
  } }, { label: 'Schließen' }])
}

/* ---------- KI ---------- */
function aiDlg() {
  const a = S.settings.ai
  const prov = h('select', { onchange: sync }, [['ollama', 'Ollama (lokal)'], ['openrouter', 'OpenRouter (extern, kostenlose Modelle)']].map(([v, l]) => h('option', { value: v, selected: a.provider === v }, l)))
  const url = h('input', { value: a.ollamaUrl }), key = h('input', { type: 'password', value: a.orKey, placeholder: 'sk-or-…' })
  const status = h('div', { class: 'aistatus' }), models = h('div', { class: 'aimodels' })
  const orModel = h('select', {}, a.orModel ? [h('option', { value: a.orModel }, a.orModel)] : [])
  const secOl = h('div', {}, h('label', { class: 'row' }, h('span', {}, 'Ollama-URL'), url, h('button', { onclick: () => drawOllama() }, 'Prüfen')), status, models)
  const secOr = h('div', {}, h('label', { class: 'row' }, h('span', {}, 'OpenRouter-Schlüssel'), key), h('label', { class: 'row' }, h('span', {}, 'Modell'), orModel, h('button', { onclick: () => loadOr() }, 'Gratis-Modelle laden')),
    h('p', { class: 'muted' }, 'Datenschutz: Tab-Titel und Domains gehen an OpenRouter und das Modell. Gratis-Modelle haben ein Tageslimit; bei Limit wechselt die Erweiterung auf dein Ollama-Modell, falls eines gewählt ist.'))
  const out = h('div', { class: 'airesult' })
  const base = () => url.value.trim() || a.ollamaUrl
  const cfg = () => ({ ...a, provider: prov.value, ollamaUrl: base(), orKey: key.value.trim(), orModel: orModel.value || a.orModel })
  function sync() { secOl.hidden = prov.value !== 'ollama'; secOr.hidden = prov.value !== 'openrouter'; if (prov.value === 'ollama') drawOllama() }
  async function loadOr() { try { const ms = await ai.listModels(cfg()); orModel.replaceChildren(...ms.map((m) => h('option', { value: m, selected: m === a.orModel }, m))); toast(ms.length + ' kostenlose Modelle') } catch (e) { toast('Fehler: ' + e.message) } }
  async function use(name) { prov.value = 'ollama'; Object.assign(a, { provider: 'ollama', ollamaModel: name, ollamaUrl: base() }); await persist(); drawOllama() }
  async function drawOllama() {
    const up = await ollama.ping(base())
    const cmd = 'OLLAMA_ORIGINS=chrome-extension://*,moz-extension://*'
    status.replaceChildren(h('span', { class: 'dot ' + (up ? 'on' : 'off') }), up ? ' Ollama läuft' : ' Ollama nicht erreichbar',
      ...(up ? [] : [h('p', { class: 'muted' }, 'Entweder ist Ollama nicht gestartet (ollama.com/download) oder es blockiert diese Erweiterung. Setze diese Umgebungsvariable und starte Ollama neu:'), h('code', {}, cmd), h('button', { onclick: () => navigator.clipboard.writeText(cmd).then(() => toast('Kopiert')) }, 'Kopieren')]))
    if (!up) return models.replaceChildren()
    let have = []
    try { have = await ollama.tags(base()) } catch (e) { toast('Fehler: ' + e.message) }
    const names = new Set(have.map((m) => m.name))
    models.replaceChildren(
      ...have.map((m) => h('div', { class: 'lrow' }, h('label', {}, h('input', { type: 'radio', name: 'om', checked: a.ollamaModel === m.name, onchange: () => use(m.name) }), ` ${m.name} · ${(m.size / 1e9).toFixed(1)} GB`),
        h('button', { title: 'Löschen', onclick: async () => { if (confirm(m.name + ' löschen?')) { await ollama.remove(base(), m.name); drawOllama() } } }, '✕'))),
      h('h4', {}, 'Zum Herunterladen empfohlen'),
      ...ollama.RECOMMENDED.filter(([n]) => !names.has(n)).map(([n, d]) => {
        const bar = h('progress', { max: 100, value: 0, hidden: true }), note = h('span', { class: 'muted' }, d), b = h('button', {}, 'Herunterladen')
        b.onclick = async () => {
          const ctl = new AbortController()
          b.textContent = 'Abbrechen'; bar.hidden = false; b.onclick = () => ctl.abort()
          try { await ollama.pull(base(), n, (p) => { bar.value = p.pct ?? 0; note.textContent = p.status + (p.pct != null ? ` ${p.pct}%` : '') }, ctl.signal); toast(n + ' geladen'); await use(n) } catch (e) { toast(e.name === 'AbortError' ? 'Abgebrochen, ein neuer Start setzt fort' : 'Fehler: ' + e.message); drawOllama() }
        }
        return h('div', { class: 'lrow' }, h('span', {}, n), note, bar, b)
      }))
  }
  const runBtn = h('button', { class: 'primary', onclick: async () => {
    Object.assign(a, cfg()); await persist(); out.textContent = 'Frage KI …'
    try {
      const tabs = (await openTabs()).slice(0, 150)
      if (!tabs.length) throw new Error('Keine offenen http(s)-Tabs')
      showTopics(out, tabs, parseAiTopics(await ai.chat(a, ai.topicsMessages(tabs)), tabs.length))
    } catch (e) { out.textContent = 'Fehler: ' + e.message }
  } }, 'Offene Tabs nach Themen sortieren (Vorschlag)')
  sync()
  dialog('KI', h('div', {}, h('label', { class: 'row' }, h('span', {}, 'Anbieter'), prov), secOl, secOr, runBtn, out),
    [{ label: 'Einstellungen speichern', primary: true, fn: async () => { Object.assign(a, cfg()); await persist() } }, { label: 'Schließen' }])
}
function showTopics(out, tabs, topics) {
  out.replaceChildren(...Object.entries(topics).flatMap(([name, idx]) => [h('h4', {}, `${name} (${idx.length})`), h('ul', {}, idx.map((i) => h('li', {}, tabs[i].title || tabs[i].url)))]),
    h('div', { class: 'btns' },
      h('button', { onclick: async () => {
        const r = await importFolders(Object.entries(topics).map(([name, idx]) => ({ path: ['KI-Themen', name], items: idx.map((i) => ({ t: tabs[i].title, u: tabs[i].url })) })))
        toast(`${r.added} Lesezeichen in „KI-Themen“ gespeichert`)
      } }, 'Als Lesezeichen-Ordner speichern'),
      h('button', { onclick: async () => {
        for (const [name, idx] of Object.entries(topics)) await saveSession(S, 'KI: ' + name, idx.map((i) => tabs[i]))
        await persist(); toast('Sitzungen gespeichert')
      } }, 'Als Sitzungen speichern')))
}

/* ---------- Einstellungen, Sicherungen, Seed ---------- */
function settingsDlg() {
  const s = S.settings, bg = s.bg
  const photo = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = async () => { await B.storage.local.set({ pika_photo: r.result }); bg.type = 'photo'; await persist(); applyLook(); toast('Foto gesetzt') }
    r.readAsDataURL(f)
  } })
  const extra = h('div', { class: 'btns' }, photo,
    h('button', { type: 'button', onclick: () => photo.click() }, 'Foto als Hintergrund …'),
    h('button', { type: 'button', onclick: barsDlg }, 'Schnellwahl-Leisten …'),
    h('button', { type: 'button', onclick: backupsDlg }, 'Sicherungen …'),
    h('button', { type: 'button', onclick: seedDlg }, 'Seed importieren …'))
  ask('Einstellungen', [
    { name: 'theme', label: 'Design', type: 'select', value: s.theme, options: [['system', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']] },
    { name: 'accent', label: 'Akzentfarbe', type: 'color', value: s.accent },
    { name: 'pitch', label: 'Pitch Black (nur dunkel)', type: 'checkbox', value: s.pitch },
    { name: 'view', label: 'Ansicht', type: 'select', value: s.view, options: [['board', 'Board'], ['gallery', 'Galerie']] },
    { name: 'favicons', label: 'Seiten-Icons laden (Netzwerk)', type: 'checkbox', value: s.favicons },
    { name: 'bgType', label: 'Hintergrund', type: 'select', value: bg.type, options: [['none', 'Keiner'], ['preset', 'Vorlage'], ['color', 'Farbe'], ['gradient', 'Verlauf'], ['photo', 'Foto']] },
    { name: 'preset', label: 'Vorlage', type: 'select', value: bg.preset, options: Object.keys(PRESETS) },
    { name: 'c1', label: 'Farbe 1', type: 'color', value: bg.c1 }, { name: 'c2', label: 'Farbe 2', type: 'color', value: bg.c2 },
    { name: 'intensity', label: 'Intensität', type: 'range', min: 0, max: 100, value: bg.intensity },
    { name: 'grain', label: 'Körnung', type: 'range', min: 0, max: 100, value: bg.grain },
    { name: 'parallax', label: 'Parallax', type: 'checkbox', value: bg.parallax },
    { name: 'hidden', label: 'Ausgeblendete Domains', value: s.hidden.join(', '), placeholder: 'a.com, b.org' },
  ], { ok: 'Speichern', extra }).then(async (v) => {
    if (!v) return
    Object.assign(s, { theme: v.theme, accent: v.accent, pitch: v.pitch, view: v.view, favicons: v.favicons, hidden: v.hidden.split(',').map((x) => x.trim()).filter(Boolean) })
    Object.assign(bg, { type: v.bgType, preset: v.preset, c1: v.c1, c2: v.c2, intensity: v.intensity, grain: v.grain, parallax: v.parallax })
    await persist(); await applyLook(); render()
  })
}
async function barsDlg() {
  const v = await ask('Schnellwahl-Leisten', [{ name: 't', label: 'Name ; top|recent|today ; Filter (Regex) ; Anzahl', type: 'textarea', rows: 8, value: barsToText(S.settings.bars) }])
  if (!v) return
  S.settings.bars = parseBars(v.t)
  await persist(); renderBars()
}
async function backupsDlg() {
  const body = h('div', { class: 'list' })
  const file = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async (e) => {
    try { await doRestore(JSON.parse(await e.target.files[0].text())) } catch (err) { toast('Import fehlgeschlagen: ' + err.message) }
  } })
  const doRestore = async (b) => {
    if (!confirm('Einstellungen ersetzen und fehlende Lesezeichen neu anlegen? (Vorhandene Lesezeichen werden nicht gelöscht)')) return
    importing = true
    try { const r = await restore(b); toast(`Wiederhergestellt, ${r.added} Lesezeichen ergänzt`) } finally { importing = false }
    setTimeout(() => location.reload(), 800)
  }
  const draw = async () => {
    const l = await listBackups()
    body.replaceChildren(file, ...(l.length ? l.map((b) => h('div', { class: 'lrow' }, h('span', {}, new Date(b.ts).toLocaleString('de-DE') + ` · ${b.folders.reduce((a, f) => a + f.items.length, 0)} Lesezeichen`), h('button', { onclick: () => doRestore(b) }, 'Wiederherstellen'))) : [h('p', { class: 'muted' }, 'Noch keine Sicherung. Täglich automatisch, die letzten 7 bleiben.')]))
  }
  await draw()
  dialog('Sicherungen', body, [
    { label: 'Jetzt sichern', fn: async () => { await saveBackup(); await draw(); return false } },
    { label: 'Exportieren (Datei)', fn: async () => {
      const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(await makeBackup())], { type: 'application/json' })), download: `pika-own-backup-${new Date().toISOString().slice(0, 10)}.json` })
      a.click(); return false
    } },
    { label: 'Importieren …', fn: () => { file.click(); return false } }, { label: 'Schließen' }])
}
async function seedDlg() {
  let folders
  try { const r = await fetch(B.runtime.getURL('data/seed-folders.json')); if (!r.ok) throw 0; folders = await r.json() } catch { return toast('data/seed-folders.json fehlt – erst „npm run seed“ ausführen und die Erweiterung neu laden') }
  const n = folders.reduce((a, f) => a + f.items.length, 0)
  if (!confirm(`${n} Lesezeichen in ${folders.length} Ordnern importieren?\nBereits vorhandene URLs werden übersprungen. Firefox Sync/Chrome-Sync übertragen sie auf andere Geräte.`)) return
  importing = true
  toast('Import läuft …')
  try { const r = await importFolders(folders, (k) => toast(k + ' …')); toast(`Fertig: ${r.added} Lesezeichen, ${r.made} neue Ordner`) } catch (e) { toast('Fehler: ' + e.message) } finally { importing = false }
  T = await B.bookmarks.getTree(); index(); render()
}

/* ---------- Start ---------- */
function render() { renderHead(); renderPinned(); renderTags(); renderWidgets(); renderBars(); renderBoard() }
;(async () => {
  S = await load()
  T = await B.bookmarks.getTree(); index()
  await applyLook()
  render()
  histItems = await loadItems()
  renderBars(); renderResume()
  for (const ev of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) B.bookmarks[ev].addListener(reloadSoon)
})()
