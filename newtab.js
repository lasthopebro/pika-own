import { B } from './lib/api.js'
import { load, update, patchWidget, addWidget as storeAddWidget, removeWidget } from './lib/store.js'
import { applyTopics, undo as undoLf, emptyFolders } from './lib/folders.js'
import { h, toast, menu, dialog, ask, tile } from './lib/ui.js'
import { domainOf, groupHistory, renameName, parseAiTopics, score, parseBars, barsToText } from './lib/logic.js'
import { loadItems } from './lib/dials.js'
import { treeToFolders, importFolders, barOf } from './lib/seed.js'
import { saveBackup, listBackups, makeExport, isBackup, restore } from './lib/backup.js'
import * as bf from './lib/backup-folder.js'
import { fileName, toDelete, dayKey, isFreshProfile, checkSize } from './lib/backup-plan.js'
import { openTabs, saveSession, openSession } from './lib/sessions.js'
import * as ai from './lib/ai.js'
import * as ollama from './lib/ollama.js'
import { resumeCards } from './lib/resume.js'
import { trashAdd, restoreParent, findDupes, discovery, mdLink, toTree, TRASH_MAX } from './lib/board.js'
import { urlsFromText, backupNagDue, NAG_MS, absorb, canon } from './lib/quick.js'
import { WIDGETS } from './widgets/index.js'
import { cleanPath, crumbs, children, filterChildren, up, pathTo, folderList } from './lib/gallery.js'
import { runTour } from './lib/tour-ui.js'
import { permsNode } from './lib/perms-ui.js'

let S, T, histItems = [], filterTag = '', selMode = false, focus = null, drag = null, importing = false
const own = new Set() // selbst geschriebene Stände (JSON), damit deren Änderungsereignis nicht neu lädt
const byId = new Map()
const sel = new Set()
const $ = (id) => document.getElementById(id)
// lf/snapshots schreiben auch Hintergrund und Leiste: nie mit altem Stand überschreiben. own = zuletzt selbst geschrieben.
const remember = (st) => { if (own.size > 20) own.clear(); own.add(canon(st)) }
// Widgets schreiben nur über patchWidget/addWidget/removeWidget; persist() übernimmt deren gespeicherten Stand (in die vorhandenen Objekte, damit offene Widgets aktuell bleiben).
const persist = () => update((cur) => {
  const stored = new Map(cur.workspaces.map((x) => [x.id, x.widgets])), local = new Map(S.workspaces.flatMap((x) => x.widgets || []).map((w) => [w?.id, w]))
  Object.assign(cur, S, { lf: cur.lf, snapshots: cur.snapshots }); S.lf = cur.lf; S.snapshots = cur.snapshots
  for (const x of cur.workspaces) if (stored.has(x.id)) x.widgets = (stored.get(x.id) || []).map((sw) => (sw && local.has(sw.id) ? sync(local.get(sw.id), sw) : sw))
  remember(cur)
})
const ws = () => S.workspaces.find((w) => w.id === S.currentWs) || S.workspaces[0]
const mk = (n) => n.url || 'f:' + n.id
const mt = (k) => (S.meta[k] ||= {})
const go = (url) => { location.href = url }
const I = (name, label) => globalThis.PikaIcons.icon(name, label)
// Symbol-Knopf: der Name steht in title und aria-label, das Symbol selbst bleibt stumm.
const btn = (name, label, fn) => h('button', { class: 'ico', title: label, 'aria-label': label, onclick: fn }, I(name))
const copy = (text, msg) => navigator.clipboard.writeText(text).then(() => toast(msg), () => toast('Kopieren nicht möglich'))
const COLORS = [['', 'Keine'], ['#ef4444', 'Rot'], ['#f97316', 'Orange'], ['#eab308', 'Gelb'], ['#22c55e', 'Grün'], ['#3b82f6', 'Blau'], ['#a855f7', 'Violett']]
const FONTS = { sans: '', mono: 'ui-monospace,Consolas,monospace', serif: 'Georgia,serif' }
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
  if (S.settings.discover) {
    const u = urlsOf(T[0])
    cols.push({ id: 'virtual-recent', title: 'Zuletzt hinzugefügt', children: discovery('recent', u), virtual: true },
      { id: 'virtual-top', title: 'Meistbesucht', children: discovery('top', u, histItems), virtual: true })
  }
  if (S.settings.emptyCol) cols.push({ id: 'virtual-empty', title: 'Leere Ordner', children: emptyFolders(T[0]), virtual: true })
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
  r.style.fontFamily = FONTS[s.font] || ''
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
    h('button', { class: 'search', 'aria-label': 'Suchen (F)', onclick: palette }, I('search'), 'Suchen … (F)'),
    btn('select', 'Auswahlmodus (S)', toggleSel), btn('view', 'Board / Galerie (V)', toggleView),
    btn('save', 'Alle Tabs als Ordner speichern', saveTabsFolder), btn('ai', 'KI', aiDlg), btn('settings', 'Einstellungen', settingsDlg),
    btn('more', 'Mehr', moreMenu))
}
// Seltenes aus dem Kopf: Workspaces, Widget, Sitzungen.
function moreMenu(e) {
  menu(e, [
    { label: 'Workspace anlegen', icon: 'plus', kbd: 'N', fn: newWs }, { label: 'Workspace bearbeiten', icon: 'edit', fn: editWs },
    { label: 'Widget hinzufügen', icon: 'widget', fn: addWidget }, { label: 'Tab-Sitzungen', icon: 'clock', fn: sessionsDlg },
    { sep: 1 }, { label: 'Tastenkürzel', icon: 'keyboard', kbd: '?', fn: keysDlg },
  ])
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
// Hülle: Kasten, Titel, Entfernen, Fehlerkarte, Schreibweg. Alles Typspezifische steht in widgets/<typ>.js (Liste: widgets/index.js).
let ticks = []
setInterval(() => ticks.forEach((f) => f()), 1000)
function renderWidgets() {
  ticks = []
  $('widgets').replaceChildren(...(ws().widgets || []).map(widgetEl))
}
// Abgleich mit dem gespeicherten Stand (auch gelöschte Felder), damit persist() ein Widget nie zurückdreht.
const sync = (local, saved) => { for (const k of Object.keys(local)) if (!(k in saved)) delete local[k]; return Object.assign(local, saved) }
const dropWidget = async (id) => { await removeWidget(id, remember); for (const x of S.workspaces) x.widgets = (x.widgets || []).filter((y) => y?.id !== id); renderWidgets() }
const removeMenu = (w) => (e) => { e.preventDefault(); menu(e, [{ label: 'Widget entfernen', fn: () => dropWidget(w?.id) }]) }
const errorCard = (w, e) => h('div', { class: 'widget widget-error', oncontextmenu: removeMenu(w) }, h('div', { class: 'wtitle' }, 'Widget-Fehler'), h('div', { class: 'muted' }, `${w?.type}: ${e?.message || e}`), h('button', { onclick: () => dropWidget(w?.id) }, 'Entfernen'))
function widgetEl(w) {
  const big = h('div', { class: 'wbig' }), sub = h('div', { class: 'muted' }), mine = []
  try {
    const def = WIDGETS[w?.type]
    if (!def) throw new Error('Unbekannter Widget-Typ')
    const box = h('div', { class: 'widget', oncontextmenu: removeMenu(w) }, h('div', { class: 'wtitle' }, def.title(w)), big, sub)
    box.dataset.wid = w.id
    def.render(w, {
      big, sub, box, h, toast, ask, icon: I, redraw: renderWidgets,
      // erster Lauf sofort (wirft er, wird es eine Fehlerkarte); später ersetzt ein Fehler nur diesen Kasten
      tick: (f) => { f(); const t = () => { try { f() } catch (e) { ticks = ticks.filter((x) => x !== t); box.replaceWith(errorCard(w, e)) } }; mine.push(t); ticks.push(t) },
      patch: async (fn) => { const saved = await patchWidget(w.id, fn, remember); return saved && sync(w, saved) },
    })
    return box
  } catch (e) { ticks = ticks.filter((x) => !mine.includes(x)); return errorCard(w, e) }
}
async function addWidget() {
  const t = await ask('Widget', [{ name: 'type', label: 'Typ', type: 'select', options: Object.values(WIDGETS).map((d) => [d.type, d.label]) }])
  if (!t) return
  const def = WIDGETS[t.type], d = def.defaults(S)
  const v = await ask('Widget: ' + t.type, def.fields(d))
  if (!v) return
  const made = def.make ? def.make(v, d) : { ...d, ...v } // make darf einen Fehlertext liefern
  if (typeof made === 'string') return toast(made)
  const w = { id: crypto.randomUUID(), type: t.type, ...made }
  await storeAddWidget(ws().id, w, remember); (ws().widgets ||= []).push(w); renderWidgets()
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
    onclick: (e) => {
      if (selMode) { e.preventDefault(); sel.has(n.id) ? sel.delete(n.id) : sel.add(n.id); a.classList.toggle('sel'); if (cb) cb.checked = sel.has(n.id); renderSelBar() }
      else if (S.settings.openInNewTab && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); B.tabs.create({ url: n.url }).catch(() => {}) } // Option: Board-Links im neuen Tab
    },
    oncontextmenu: (e) => { e.preventDefault(); itemMenu(e, n) },
    ondragstart: () => { drag = n.id }, ondragover: (e) => e.preventDefault(),
    ondrop: (e) => { e.preventDefault(); e.stopPropagation(); dropOn(n.parentId, n.index, e) },
  }, cb, iconEl(n, m), h('span', { class: 't' }, n.title || n.url), m.fav ? '★' : null,
    m.comment ? h('span', { title: m.comment }, '📝') : null,
    m.remind ? h('span', { title: new Date(m.remind).toLocaleString('de-DE') }, '⏰') : null,
    (m.tags || []).map((t) => h('span', { class: 'tag', style: { background: S.tags[t] || '#888' } }, t)))
  return a
}
function folderEl(n) {
  const d = h('details', { class: 'sub', open: S.open[n.id] ?? true },
    h('summary', { oncontextmenu: (e) => { e.preventDefault(); colMenu(e, n, true) }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); e.stopPropagation(); dropOn(n.id, undefined, e) } },
      h('span', {}, I('folder'), ' ' + (n.title || 'Ordner')), h('span', { class: 'muted' }, ' ' + countUrls(n))),
    h('div', { class: 'subbody' }, (n.children || []).filter(passes).map((c) => (c.url ? itemEl(c) : folderEl(c)))))
  d.addEventListener('toggle', () => { if (d.open !== (S.open[n.id] ?? true)) { S.open[n.id] = d.open; persist() } })
  return d
}
function colEl(f) {
  const cm = ws().colNames[f.id] || {}, emp = f.id === 'virtual-empty' // Zusatzspalte „Leere Ordner“: zählt Ordner, nimmt nichts per Ziehen an
  return h('section', {
    class: 'col', style: { '--c': cm.color || 'var(--bd)' }, ondragover: (e) => e.preventDefault(),
    ondrop: (e) => { e.preventDefault(); if (emp) drag = null; else dropOn(f.virtual ? barOf(T).id : f.id, undefined, e) },
  }, h('header', { class: 'colhead' }, h('span', { class: 'colname' }, cm.name || f.title || '(ohne Namen)'), h('span', { class: 'muted' }, String(emp ? f.children.length : countUrls(f))), emp && f.children.length ? h('button', { onclick: () => cleanEmpty(f.children) }, 'Alle aufräumen') : null, h('button', { class: 'ico', title: 'Spaltenmenü', 'aria-label': 'Spaltenmenü', onclick: (e) => colMenu(e, f) }, I('more'))),
  h('div', { class: 'colbody' }, (f.children || []).filter(passes).map((n) => (n.url ? itemEl(n) : folderEl(n))), emp && !f.children.length ? h('p', { class: 'muted' }, 'Keine leeren Ordner.') : null))
}
function renderBoard() {
  const b = $('board')
  b.classList.toggle('gallery', S.settings.view === 'gallery')
  b.classList.toggle('compact', S.settings.view === 'compact')
  const cols = focus ? [byId.get(focus)].filter(Boolean) : columnsFor(ws())
  b.replaceChildren(...[focus ? h('button', { onclick: () => { focus = null; renderBoard() } }, '← Alle Spalten') : null, ...cols.map(colEl),
    cols.length ? null : h('p', { class: 'muted' }, 'Keine Lesezeichen. Einstellungen → „Seed importieren“ oder Lesezeichen anlegen.')].filter(Boolean))
  renderSelBar()
  if (gal) drawGal()
}
async function dropOn(parentId, index, ev) {
  const id = drag; drag = null
  if (!id) { // von außen hineingezogen (Adressleiste, andere Seite, Leiste): als neue Lesezeichen ablegen
    const dt = ev?.dataTransfer
    const urls = dt ? urlsFromText(dt.getData('text/uri-list') || dt.getData('text/plain')) : []
    if (urls.length) addLinks(urls, parentId, index)
    return
  }
  if (id === parentId) return
  try { await B.bookmarks.move(id, index == null ? { parentId } : { parentId, index }) } catch (e) { toast(e.message) }
}
// Ziel für Einfügen: der gezeigte Ordner (Fokus), sonst die erste echte Spalte, sonst die Lesezeichenleiste.
const targetFolder = () => (focus && byId.get(focus) && !byId.get(focus).url ? focus : columnsFor(ws()).find((c) => !c.virtual)?.id || barOf(T).id)
async function addLinks(urls, parentId = targetFolder(), index) {
  const tabs = await B.tabs.query({}).catch(() => [])
  const made = []
  for (const [k, url] of urls.slice(0, 50).entries()) {
    const title = tabs.find((t) => t.url === url)?.title || domainOf(url)
    try { made.push(await B.bookmarks.create({ parentId, url, title, ...(index != null ? { index: index + k } : {}) })) } catch (e) { toast(e.message) }
  }
  if (!made.length) return
  toast(`${made.length === 1 ? '1 Link' : made.length + ' Links'} gespeichert in „${byId.get(parentId)?.title || 'Ordner'}“`, { label: 'Rückgängig', fn: async () => {
    for (const b of made) await B.bookmarks.remove(b.id).catch(() => {})
    toast('Zurückgenommen')
  } })
}
addEventListener('paste', (e) => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return
  const urls = urlsFromText(e.clipboardData.getData('text/uri-list') || e.clipboardData.getData('text/plain'))
  if (!urls.length) return
  e.preventDefault(); addLinks(urls)
})
async function saveTabsFolder() {
  const r = await B.runtime.sendMessage({ type: 'saveTabsFolder' })
  if (r?.error) return toast('Nicht gespeichert: ' + r.error)
  if (!r?.n) return toast('Keine http(s)-Tabs in diesem Fenster')
  toast(`${r.n} Tabs gespeichert in „${r.title}“`, { label: 'Rückgängig', fn: () => B.bookmarks.removeTree(r.id).then(() => toast('Zurückgenommen'), (e) => toast(e.message)) })
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
  const lfSub = S.lf.length ? S.lf.map((f) => ({ label: `${f.icon} ${f.name}`, fn: async () => {
    await B.runtime.sendMessage({ type: 'lf', op: 'assign', args: [f.id, n.url, n.title || n.url] })
    toast(`In „${f.name}“ gelegt`)
  } })) : [{ label: 'Noch kein Live-Ordner (Leiste: Plus)', disabled: true }]
  menu(e, [
    n.url ? { label: 'In neuem Tab öffnen', icon: 'right', fn: () => B.tabs.create({ url: n.url }) } : { label: 'Alle öffnen', icon: 'right', fn: () => openAll(n) },
    n.url && { label: 'In neuem Fenster öffnen', icon: 'window', fn: () => B.windows.create({ url: n.url }) },
    n.url && { label: 'In Live-Ordner legen', icon: 'folder', sub: lfSub },
    n.url && { label: 'Link kopieren', icon: 'link', fn: () => copy(n.url, 'Link kopiert') },
    n.url && { label: 'Als Markdown kopieren', icon: 'copy', fn: () => copy(mdLink(n.title, n.url), 'Markdown kopiert') },
    { sep: 1 },
    { label: m.fav ? 'Favorit entfernen' : 'Favorit', icon: 'star', fn: () => patch(targets, (x) => { x.fav = !m.fav }) },
    n.url && { label: ws().pinned.some((p) => p.url === n.url) ? 'Pin entfernen' : 'Anpinnen', icon: 'pin', fn: () => togglePin(n.url, n.title) },
    { sep: 1 },
    { label: 'Tags …', icon: 'tag', fn: () => tagsDlg(targets) },
    { label: 'Kommentar …', fn: () => commentDlg(n) },
    { label: 'Erinnerung …', icon: 'bell', fn: () => remindDlg(n) },
    { label: 'Icon (Emoji) …', fn: () => iconDlg(n) },
    { label: 'Farbmarkierung …', icon: 'palette', fn: () => colorDlg(targets) },
    { sep: 1 },
    { label: 'Umbenennen …', icon: 'edit', fn: () => renameOne(n) },
    { label: targets.length > 1 ? `Sammelumbenennen (${targets.length}) …` : 'Sammelumbenennen …', fn: () => bulkRename(targets) },
    { label: 'Löschen', icon: 'trash', fn: () => del(targets) },
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
// 24 Emoji als Knöpfe (Tastatur: Tab und Enter); pick(emoji, event) setzt die Auswahl.
const emojiGrid = (pick) => h('div', { class: 'egrid' }, PikaIcons.EMOJI.map((em) => h('button', { type: 'button', title: 'Symbol ' + em, 'aria-label': 'Symbol ' + em, onclick: (e) => pick(em, e) }, em)))
async function iconDlg(n) {
  const grid = emojiGrid((em, e) => { e.currentTarget.closest('form').querySelector('input').value = em })
  const v = await ask('Icon', [{ name: 'i', label: 'Emoji (leer = Standard)', value: S.meta[mk(n)]?.icon || '' }], { extra: grid })
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
  // Einzelne Links ohne Nachfrage nur, wenn die Option aus ist (dann mit Rückgängig); Ordner immer mit Bestätigung.
  const quiet = !S.settings.confirmDelete && nodes.every((n) => n.url)
  if (!quiet && !confirm(`${nodes.length} Eintrag/Einträge löschen? (Ordner mit Inhalt)`)) return
  const snap = nodes.map(({ parentId, index, title, url }) => ({ parentId, index, title, url }))
  await trashNodes(nodes)
  sel.clear()
  if (!quiet) return toast('In den Papierkorb verschoben (7 Tage)')
  toast(snap.length === 1 ? 'Link gelöscht' : `${snap.length} Links gelöscht`, { label: 'Rückgängig', fn: async () => {
    for (const x of snap.sort((p, q) => p.index - q.index)) {
      const props = { parentId: x.parentId, title: x.title, url: x.url }
      await B.bookmarks.create({ ...props, index: x.index }).catch(() => B.bookmarks.create(props)).catch((e) => toast(e.message))
    }
    S.trash = S.trash.filter((e) => !snap.some((x) => e.tree.url === x.url && e.parentId === x.parentId && e.index === x.index))
    await persist(); toast('Wiederhergestellt')
  } })
}
// Erst in den Papierkorb, dann löschen: ein Fehler beim Löschen verliert nichts.
async function trashNodes(nodes) {
  for (const n of nodes) S.trash = trashAdd(S.trash, n, Date.now())
  await persist()
  for (const n of nodes) { try { n.url ? await B.bookmarks.remove(n.id) : await B.bookmarks.removeTree(n.id) } catch (e) { toast(e.message) } }
}
// „Alle aufräumen“ der Spalte Leere Ordner: Anzahl nennen, über den Papierkorb löschen (höchstens TRASH_MAX auf einmal), Rückgängig legt sie an die alte Stelle zurück.
async function cleanEmpty(folders) {
  const batch = folders.slice(0, TRASH_MAX), rest = folders.length - batch.length
  if (!confirm(`${batch.length} leere Ordner in den Papierkorb verschieben?${rest ? ` (${rest} weitere beim nächsten Mal)` : ''}${S.trash.length + batch.length > TRASH_MAX ? `\nDer Papierkorb fasst ${TRASH_MAX} Einträge: ältere fallen heraus.` : ''}`)) return
  const snap = batch.map((n) => ({ parentId: n.parentId, index: n.index, tree: toTree(n) }))
  await trashNodes(batch)
  toast(`${batch.length} leere Ordner im Papierkorb`, { label: 'Rückgängig', fn: async () => {
    for (const x of snap.sort((p, q) => p.index - q.index)) {
      const p = byId.has(x.parentId) ? x.parentId : barOf(T).id
      await restoreTree(x.tree, p, p === x.parentId ? x.index : undefined).catch(() => restoreTree(x.tree, p)).catch((e) => toast(e.message))
    }
    S.trash = S.trash.filter((e) => !snap.some((x) => !e.tree.url && e.parentId === x.parentId && e.index === x.index && e.tree.title === x.tree.title))
    await persist(); toast('Wiederhergestellt')
  } })
}
async function restoreTree(t, parentId, index) {
  const n = await B.bookmarks.create(t.url ? { parentId, index, title: t.title, url: t.url } : { parentId, index, title: t.title })
  for (const c of t.children || []) await restoreTree(c, n.id)
}
function trashDlg() {
  const body = h('div', { class: 'list' })
  const draw = () => body.replaceChildren(...(S.trash.length ? S.trash.map((e) => h('div', { class: 'lrow' },
    h('span', {}, `${e.tree.title || e.tree.url} · ${new Date(e.at).toLocaleDateString('de-DE')}${e.tree.children ? ` · ${e.tree.children.length} Einträge` : ''}`),
    h('button', { onclick: async () => {
      const p = restoreParent(e, (id) => byId.has(id), barOf(T).id)
      await restoreTree(e.tree, p, p === e.parentId ? e.index : undefined)
      S.trash = S.trash.filter((x) => x !== e); await persist(); draw(); toast('Wiederhergestellt')
    } }, 'Wiederherstellen'))) : [h('p', { class: 'muted' }, 'Papierkorb ist leer (7 Tage, höchstens 20 Einträge).')]))
  draw()
  dialog('Papierkorb', body)
}
function dupesDlg() {
  const groups = findDupes(urlsOf(T[0]))
  if (!groups.length) return toast('Keine Dubletten gefunden')
  // Tags und Favorit der gelöschten Kopien wandern auf das behaltene (gleiche URL = gleicher meta-Schlüssel).
  dialog(`Dubletten (${groups.length} URLs)`, h('div', { class: 'list' }, groups.map((g) => h('div', { class: 'lrow' }, h('span', {}, `${g.length}× ${g[0].title || g[0].url}`)))), [
    { label: 'Abbrechen' },
    { label: 'Je eines behalten', primary: true, fn: async () => { await trashNodes(groups.flatMap((g) => g.slice(1))); toast('Dubletten im Papierkorb') } }])
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

/* ---------- Galerie (Vollbild) ---------- */
// Zustand nur im Speicher, beim Navigieren wird nichts geschrieben: gal = null (zu) oder { path: Ordner-IDs ([] = Home), q: Suchtext, limit, back, el }.
// Suchfeld und Knöpfe in el bleiben beim Neuzeichnen stehen, damit eine Änderung aus einem anderen Neuen Tab die Eingabe nicht verwirft.
let gal = null
const GAL_STEP = 300 // shortcut: keine Virtualisierung, erst 300 Kacheln, dann „Mehr zeigen“; bei tausenden Einträgen je Ordner virtualisieren
const galHome = () => columnsFor(ws())
const galNodes = () => new Map([...byId, ...galHome().map((c) => [c.id, c])])
const galTiles = () => [...gal.el.grid.querySelectorAll('.item')]
const galBehind = () => [$('top'), $('pikabar'), document.querySelector('main')]
function galOpen() {
  if (gal) return
  const el = {}
  const seg = (key, opts) => opts.map(([v, label, name]) => h('button', { type: 'button', 'data-k': key, 'data-v': v, title: name, 'aria-label': name, onclick: () => galSet(key, v) }, label))
  el.q = h('input', {
    type: 'search', class: 'gq', 'aria-label': 'In diesem Ordner suchen', placeholder: 'In diesem Ordner suchen …',
    oninput: () => { gal.q = el.q.value; gal.limit = GAL_STEP; drawGal() },
    onkeydown: (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); galTiles()[0]?.focus() }
      else if (e.key === 'Enter') { e.preventDefault(); galTiles()[0]?.click() }
      else if (e.key === 'Escape') { e.preventDefault(); galEsc() }
    },
  })
  el.path = h('nav', { class: 'gpath', 'aria-label': 'Pfad' })
  el.ctl = h('div', { class: 'gctl', role: 'group', 'aria-label': 'Darstellung' },
    seg('galleryMode', [['grid', 'Raster', 'Raster'], ['list', 'Liste', 'Liste']]), seg('galleryDensity', [['s', 'S', 'Dichte klein'], ['m', 'M', 'Dichte mittel'], ['l', 'L', 'Dichte groß']]),
    h('button', { type: 'button', onclick: galClose }, 'Zurück zum Board'))
  el.grid = h('div', { class: 'ggrid', role: 'group', onkeydown: (e) => {
    const t = galTiles(), i = t.indexOf(document.activeElement), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (i < 0 || e.ctrlKey || e.metaKey || e.altKey) return
    if (d) { e.preventDefault(); (t[i + d] || (d < 0 ? el.q : t[i])).focus() }
    else if (e.key === 'Home') { e.preventDefault(); t[0].focus() } else if (e.key === 'End') { e.preventDefault(); t.at(-1).focus() }
  } })
  el.side = h('nav', { class: 'gside', 'aria-label': 'Ordner dieses Workspace' })
  el.status = h('div', { class: 'sr', role: 'status' })
  el.root = h('section', { id: 'gal', 'aria-label': 'Galerie' }, el.q, el.path, el.ctl, el.grid, el.side, el.status)
  gal = { path: [], q: '', limit: GAL_STEP, back: document.activeElement, el }
  document.body.append(el.root)
  galBehind().forEach((x) => { x.inert = true }) // Tab erreicht nur noch die Galerie
  drawGal(null)
}
function galClose() {
  if (!gal) return
  const { back, el } = gal
  el.root.remove(); gal = null
  galBehind().forEach((x) => { x.inert = false })
  ;(back?.isConnected && back !== document.body ? back : document.querySelector('#top button[aria-label^="Board / Galerie"]'))?.focus()
}
// Galerie auf diesen Pfad setzen; Suchfeld wird geleert. focusId = Kachel, die den Fokus bekommt (null: die erste).
function galGo(path, focusId = null) {
  gal.path = path; gal.q = ''; gal.limit = GAL_STEP; gal.el.q.value = ''
  drawGal(focusId)
}
// Esc: erst Suchfeld leeren, dann eine Ebene hoch (Fokus auf die verlassene Kachel), auf Home zurück zum Board.
function galEsc() {
  if (gal.q) { gal.q = ''; gal.limit = GAL_STEP; gal.el.q.value = ''; drawGal(); gal.el.q.focus(); return }
  const p = up(gal.path)
  if (p) galGo(p, gal.path.at(-1)); else galClose()
}
function galSet(key, v) {
  S.settings[key] = v; drawGal()
  update((cur) => { cur.settings[key] = v; remember(cur) }) // nur dieses Feld, nie den ganzen Tab-Stand
}
function galDrop(el, parentId, title) {
  el.addEventListener('dragover', (e) => e.preventDefault())
  el.addEventListener('dragenter', () => el.classList.add('over'))
  el.addEventListener('dragleave', () => el.classList.remove('over'))
  el.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.remove('over'); dropSide(parentId, title, e) })
}
// Ablegen auf einen Ordner (Seitenleiste oder Ordner-Kachel): bestehende dropOn-Verschiebung, danach Meldung mit Rückgängig.
async function dropSide(parentId, title, ev) {
  const n = byId.get(drag), from = n && { parentId: n.parentId, index: n.index }
  if (n && n.parentId === parentId) { drag = null; return } // eigener Elternordner: nichts umsortieren
  await dropOn(parentId, undefined, ev)
  if (!n || n.id === parentId) return
  const now = (await B.bookmarks.get(n.id).catch(() => []))[0]
  if (!now || now.parentId !== parentId || from.parentId === parentId) return
  toast(`Verschoben nach „${title}“`, { label: 'Rückgängig', fn: () => B.bookmarks.move(n.id, from).then(() => toast('Zurückgenommen'), (e) => toast(e.message)) })
}
function galTile(n) {
  let a
  if (n.url) { a = itemEl(n); a.append(h('span', { class: 'gurl muted' }, domainOf(n.url))); a.addEventListener('dragend', () => { drag = null }) }
  else {
    const c = countUrls(n)
    a = h('button', { type: 'button', class: 'item gfolder', title: n.title, 'aria-label': `${n.title || 'Ordner'}, Ordner, ${c} Lesezeichen`, onclick: () => galGo([...gal.path, n.id]) },
      I('folder'), h('span', { class: 't' }, n.title || 'Ordner'), h('span', { class: 'muted' }, String(c)))
    if (!n.virtual) { a.draggable = true; a.addEventListener('dragstart', () => { drag = n.id }); a.addEventListener('dragend', () => { drag = null }) }
    const to = n.virtual ? (n.id === 'virtual' ? barOf(T).id : null) : n.id
    if (to) galDrop(a, to, n.title)
    else { a.addEventListener('dragover', (e) => e.preventDefault()); a.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); drag = null }) } // virtuell: nichts ablegen, aber auch nicht die Seite öffnen
  }
  a.dataset.id = n.id
  return a
}
function drawGal(focusId) {
  const { el } = gal, st = S.settings, nodes = galNodes(), home = galHome()
  gal.path = cleanPath(gal.path, nodes) // gelöschter Ordner: Pfad bis zur letzten gültigen Stufe kürzen
  const cs = crumbs(gal.path, nodes), cur = gal.path.length ? nodes.get(gal.path.at(-1)) : { children: home }
  const all = filterChildren(children(cur), gal.q), shown = all.slice(0, gal.limit)
  const act = document.activeElement, had = el.grid.contains(act) ? act.dataset.id : null
  const keepSide = el.side.contains(act) ? act.dataset.id : null, keepPath = el.path.contains(act) ? act.dataset.i : null
  el.root.dataset.mode = st.galleryMode; el.root.dataset.d = st.galleryDensity
  for (const b of el.ctl.querySelectorAll('[data-k]')) b.setAttribute('aria-pressed', String(st[b.dataset.k] === b.dataset.v))
  const pk = JSON.stringify(cs.map((c) => [c.id, c.title])) // Pfad und Seitenleiste nur bei Änderung neu zeichnen, nicht bei jedem Tastendruck im Suchfeld
  if (el.path.dataset.k !== pk) {
    el.path.dataset.k = pk
    el.path.replaceChildren(h('button', { type: 'button', 'data-i': '-1', 'aria-current': cs.length ? null : 'page', onclick: () => galGo([]) }, 'Home'),
      ...cs.flatMap((c, i) => [h('span', { 'aria-hidden': 'true' }, '›'), h('button', { type: 'button', 'data-i': String(i), 'aria-current': i === cs.length - 1 ? 'page' : null, onclick: () => galGo(gal.path.slice(0, i + 1)) }, c.title)]))
  }
  el.grid.setAttribute('aria-label', cs.length ? cs.at(-1).title : 'Home')
  el.grid.replaceChildren(...shown.map(galTile),
    all.length > shown.length ? h('button', { type: 'button', class: 'gmore', onclick: () => { gal.limit += GAL_STEP; drawGal(all[shown.length].id) } }, `Mehr zeigen (${all.length - shown.length} weitere)`) : null,
    all.length ? null : h('p', { class: 'muted' }, gal.q ? `Keine Treffer für „${gal.q}“.` : 'Dieser Ordner ist leer.'))
  el.status.textContent = `${all.length} ${all.length === 1 ? 'Eintrag' : 'Einträge'}`
  const here = gal.path.at(-1)
  const fl = folderList(home, barOf(T).id), sk = JSON.stringify([here, fl.map((f) => [f.id, f.depth, f.title])])
  if (el.side.dataset.k !== sk) {
  el.side.dataset.k = sk
  el.side.replaceChildren(h('b', { class: 'muted' }, 'Ordner (hierher ziehen)'), ...fl.map((f) => {
    const b = h('button', { type: 'button', 'data-id': f.id, class: 'gs' + (f.id === here ? ' on' : ''), style: { '--d': f.depth }, title: f.title, onclick: () => galGo(pathTo(f.id, byId, home.map((c) => c.id))) }, I('folder'), h('span', {}, f.title))
    galDrop(b, f.id, f.title)
    return b
  }))
  }
  if (focusId !== undefined || had) (((focusId ?? had) && el.grid.querySelector(`[data-id="${CSS.escape(focusId ?? had)}"]`)) || el.grid.querySelector('.item') || el.q).focus()
  else if (keepSide) (el.side.querySelector(`[data-id="${CSS.escape(keepSide)}"]`) || el.q).focus()
  else if (keepPath != null) (el.path.querySelector(`[data-i="${keepPath}"]`) || el.q).focus()
}

/* ---------- Auswahlmodus, Ansicht ---------- */
function toggleSel() { selMode = !selMode; sel.clear(); renderBoard() }
const toggleView = () => (gal ? galClose() : galOpen())
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
    ['Papierkorb', trashDlg], ['Dubletten finden', dupesDlg], ['Tour (Erste Schritte)', tourStart],
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
    else if (c === '/') rows = allFolders().filter((f) => score(rest, f.label)).map((f) => ({ label: f.label, sub: countUrls(f.node) + '', fn: () => { if (gal) galGo(pathTo(f.node.id, byId, galHome().map((c) => c.id))); else { focus = f.node.id; renderBoard() } } }))
    else if (c === '@') rows = S.workspaces.filter((w) => score(rest, w.name)).map((w) => ({ label: w.name, sub: 'Workspace', fn: async () => { S.currentWs = w.id; focus = null; if (gal) gal.path = []; await persist(); render() } }))
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
  if (gal && (k === 's' || k === 'n')) return // Auswahlmodus und neuer Workspace gehören zum Board dahinter
  if (gal && (k === 'escape' || k === 'v')) { if (k === 'v') galClose(); else galEsc(); return } // die Galerie liegt vor Auswahl, Fokus und Tag-Filter
  if (k === 'f') { e.preventDefault(); palette() }
  else if (k === 's') toggleSel()
  else if (k === 'v') toggleView()
  else if (k === 'n') newWs()
  else if (k === '?') keysDlg()
  else if (k === 'escape') { if (selMode) toggleSel(); else if (focus) { focus = null; renderBoard() } else if (filterTag) { filterTag = ''; renderTags(); renderBoard() } }
})

/* ---------- Tour ---------- */
// Beim ersten Start automatisch (settings.tourDone), sonst über die Palette. Ende, Überspringen und Esc merken sich "gesehen" nur in diesem einen Feld.
function tourStart() {
  if (document.querySelector('dialog[open]')) return
  if (gal) galClose()
  runTour(() => {
    S.settings.tourDone = true
    update((cur) => { cur.settings.tourDone = true; remember(cur) })
  })
}

/* ---------- Tastenkürzel ---------- */
async function keysDlg() {
  const cmds = ((await B.commands?.getAll?.().catch(() => [])) || []).filter((c) => c.description)
  const table = (rows) => h('table', { class: 'keys' }, rows.map(([k, d]) => h('tr', {}, h('td', {}, h('kbd', {}, k)), h('td', {}, d))))
  dialog('Tastenkürzel', h('div', {},
    h('h4', {}, 'Im Neuen Tab'),
    table([['F', 'Suche'], ['S', 'Auswahlmodus'], ['V', 'Galerie öffnen / schließen'], ['N', 'Neuer Workspace'], ['?', 'Diese Übersicht'], ['Esc', 'Auswahl, Ausschnitt oder Tag-Filter zurücksetzen; in der Galerie: Suchfeld leeren, eine Ebene hoch, zurück zum Board'], ['/', 'Suchfeld im Einstellungsdialog'], ['F, dann > Tour', 'Erste Schritte noch einmal zeigen'], ['Pfeile, Pos1, Ende, Enter, Esc', 'in jedem Menü']]),
    h('h4', {}, 'Im Browser'),
    table(cmds.map((c) => [c.shortcut || 'nicht belegt', c.description])),
    h('p', { class: 'muted' }, 'Die Browser-Kürzel änderst du in Chrome, Brave und Edge unter chrome://extensions/shortcuts, in Firefox unter about:addons (Zahnrad, „Tastenkürzel verwalten“).')))
}

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
    h('button', { title: 'Sitzung löschen', 'aria-label': 'Sitzung löschen', onclick: async () => { S.sessions = S.sessions.filter((x) => x !== s); await persist(); draw() } }, I('close')))) : [h('p', { class: 'muted' }, 'Noch keine Sitzungen.')]))
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
        h('button', { title: 'Löschen', 'aria-label': 'Modell ' + m.name + ' löschen', onclick: async () => { if (confirm(m.name + ' löschen?')) { await ollama.remove(base(), m.name); drawOllama() } } }, I('close')))),
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
      h('button', { onclick: async () => { await update((s) => applyTopics(s, topics, tabs)); toast('In Live-Ordner übernommen') } }, 'In Live-Ordner übernehmen'),
      h('button', { onclick: async () => { toast((await update((s) => undoLf(s))) ? 'Zurückgesetzt' : 'Nichts zurückzusetzen') } }, 'Rückgängig'),
      h('button', { onclick: async () => {
        for (const [name, idx] of Object.entries(topics)) await saveSession(S, 'KI: ' + name, idx.map((i) => tabs[i]))
        await persist(); toast('Sitzungen gespeichert')
      } }, 'Als Sitzungen speichern')))
}

/* ---------- Einstellungen, Sicherungen, Seed ---------- */
function settingsDlg() {
  const s = S.settings, bg = s.bg, pb = s.pagebar
  const photo = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = async () => { await B.storage.local.set({ pika_photo: r.result }); bg.type = 'photo'; await persist(); applyLook(); toast('Foto gesetzt') }
    r.readAsDataURL(f)
  } })
  // Knopf-Zeile für eine Option, die kein Feld ist (eigener Dialog, Berechtigung, Datei); label dient der Suche.
  const act = (label, text, fn) => ({ label: `${label} ${text}`, node: h('div', { class: 'btns' }, h('button', { type: 'button', onclick: fn }, text)) })
  const pbToggle = (e) => (async () => {
    if (!pb.on && !(await B.permissions.request({ origins: ['<all_urls>'] }))) return toast('Ohne Zugriff auf alle Seiten kann die Leiste dort nicht erscheinen')
    pb.on = !pb.on; await persist(); await B.runtime.sendMessage({ type: 'pagebar' })
    e.target.textContent = pb.on ? 'Leiste auf Webseiten ausschalten' : 'Leiste auf Webseiten einschalten …'
    toast(pb.on ? 'Leiste auf Webseiten an (geöffnete Seiten neu laden)' : 'Leiste auf Webseiten aus')
  })()
  const pbRow = act('Leiste auf Webseiten', pb.on ? 'Leiste auf Webseiten ausschalten' : 'Leiste auf Webseiten einschalten …', pbToggle)
  // Webseiten-Berechtigung widerrufen: Leiste aus (Skript wird in der Zentrale abgemeldet), der Knopf oben bietet das Einschalten wieder an.
  const permsRow = { label: 'Berechtigungen Zugriff Widerruf erteilt Datenschutz', node: permsNode({ manifest: B.runtime.getManifest(), perms: B.permissions, onRevoke: async (e) => {
    if (e.name !== '<all_urls>') return
    pb.on = false; await persist(); await B.runtime.sendMessage({ type: 'pagebar' })
    pbRow.node.querySelector('button').textContent = 'Leiste auf Webseiten einschalten …'
    toast('Leiste auf Webseiten aus (geöffnete Seiten neu laden)')
  } }) }
  const folderStat = h('p', { class: 'muted' })
  const paint = async () => {
    const f = S.settings.backup.folder
    if (!dirH) return void (folderStat.textContent = 'Kein Ordner gewählt.')
    const granted = (await bf.access(dirH)) === 'granted'
    folderStat.textContent = `Ordner „${dirH.name}“ ${f.on ? 'aktiv' : 'aus'}, ${f.lastWrite ? 'letzte Sicherung ' + new Date(f.lastWrite).toLocaleString('de-DE') : 'noch keine Sicherung'}${granted ? '' : '. Zugriff erneuern nötig'}`
  }
  let picked = false // Ordner im offenen Dialog gewählt: „Speichern“ darf on nicht wieder auf die alte Checkbox zurücksetzen
  const pickFolder = async () => {
    let d; try { d = await bf.pick() } catch { return } // Abbruch im Ordnerdialog
    dirH = d; await bf.saveHandle(d); S.settings.backup.folder.on = true; picked = true; await persist(); await folderBackup(true); paint()
  }
  const folderNow = async () => {
    if (!dirH) return toast('Zuerst einen Ordner wählen')
    const r = await folderBackup(true)
    if (r === 'granted') toast('In den Ordner gesichert'); else if (r !== 'error') toast('Kein Zugriff auf den Ordner, bitte „Ordner wählen“')
    paint()
  }
  paint()
  ask('Einstellungen', [
    { section: 'Aussehen' },
    { name: 'theme', label: 'Design', type: 'select', value: s.theme, options: [['system', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']] },
    { name: 'accent', label: 'Akzentfarbe', type: 'color', value: s.accent },
    { name: 'pitch', label: 'Pitch Black (nur dunkel)', type: 'checkbox', value: s.pitch },
    { name: 'font', label: 'Schriftart', type: 'select', value: s.font, options: [['sans', 'Sans'], ['mono', 'Mono'], ['serif', 'Serif']] },
    { name: 'bgType', label: 'Hintergrund', type: 'select', value: bg.type, options: [['none', 'Keiner'], ['preset', 'Vorlage'], ['color', 'Farbe'], ['gradient', 'Verlauf'], ['photo', 'Foto']] },
    { name: 'preset', label: 'Vorlage', type: 'select', value: bg.preset, options: Object.keys(PRESETS) },
    { name: 'c1', label: 'Farbe 1', type: 'color', value: bg.c1 }, { name: 'c2', label: 'Farbe 2', type: 'color', value: bg.c2 },
    { name: 'intensity', label: 'Intensität', type: 'range', min: 0, max: 100, value: bg.intensity },
    { name: 'grain', label: 'Körnung', type: 'range', min: 0, max: 100, value: bg.grain },
    { name: 'parallax', label: 'Parallax', type: 'checkbox', value: bg.parallax },
    { ...act('Hintergrund', 'Foto als Hintergrund …', () => photo.click()), keywords: 'bild' }, { label: '', node: photo },
    { section: 'Leiste' },
    { name: 'newtabBar', label: 'Leiste im Neuen Tab anzeigen', type: 'checkbox', value: s.newtabBar },
    pbRow,
    { name: 'pbExclude', label: 'Leiste auf Webseiten ausblenden bei', value: pb.exclude, placeholder: 'bank.de, mail.com' },
    { section: 'Schnellwahl' },
    { name: 'quick', label: 'Schnellwahl-Einträge in der Leiste (0 bis 20)', type: 'number', min: 0, max: 20, value: pb.quick },
    { name: 'hidden', label: 'Ausgeblendete Domains', value: s.hidden.join(', '), placeholder: 'a.com, b.org' },
    act('Schnellwahl', 'Schnellwahl-Leisten …', barsDlg),
    { section: 'Board' },
    { name: 'view', label: 'Ansicht', type: 'select', value: s.view, options: [['board', 'Board'], ['gallery', 'Spalten-Raster'], ['compact', 'Kompakte Zeilen']] },
    { name: 'galleryMode', label: 'Galerie (Taste V): Darstellung', type: 'select', value: s.galleryMode, options: [['grid', 'Raster'], ['list', 'Liste']] },
    { name: 'galleryDensity', label: 'Galerie (Taste V): Dichte', type: 'select', value: s.galleryDensity, options: [['s', 'Klein'], ['m', 'Mittel'], ['l', 'Groß']] },
    { name: 'discover', label: 'Spalten „Zuletzt hinzugefügt“ und „Meistbesucht“', type: 'checkbox', value: s.discover },
    { name: 'emptyCol', label: 'Spalte „Leere Ordner“ (mit „Alle aufräumen“)', type: 'checkbox', value: s.emptyCol },
    { name: 'openInNewTab', label: 'Links im Board im neuen Tab öffnen', type: 'checkbox', value: s.openInNewTab },
    { name: 'confirmDelete', label: 'Löschen einzelner Links bestätigen (aus: mit Rückgängig)', type: 'checkbox', value: s.confirmDelete },
    act('Seed Import', 'Seed importieren …', seedDlg),
    { section: 'Erinnerungen & Timer' },
    { name: 'pomoWork', label: 'Pomodoro: Arbeit (Minuten)', type: 'number', min: 1, max: 180, value: s.pomo.work },
    { name: 'pomoBrk', label: 'Pomodoro: Pause (Minuten)', type: 'number', min: 1, max: 60, value: s.pomo.brk },
    { section: 'Sicherung' },
    { name: 'nagDays', label: 'Hinweis auf Sicherungsdatei', type: 'select', value: s.backup.nagDays, options: [[7, 'nach 7 Tagen'], [14, 'nach 14 Tagen'], [30, 'nach 30 Tagen'], [0, 'nie']] },
    act('Sicherungen Backup', 'Sicherungen …', backupsDlg),
    ...(bf.supported() ? [{ section: 'Sicherungsordner' },
      { name: 'folderOn', label: 'Täglich in den Ordner sichern', type: 'checkbox', value: s.backup.folder.on },
      { name: 'device', label: 'Gerätename (steckt im Dateinamen)', value: s.backup.folder.device || 'geraet' },
      { label: 'Sicherungsordner Status', node: folderStat },
      act('Sicherungsordner wählen', 'Ordner wählen …', pickFolder),
      act('Sicherungsordner Zugriff erneuern', 'Zugriff erneuern', folderNow),
      act('Sicherungsordner jetzt sichern', 'Jetzt in Ordner sichern', folderNow)] : []),
    { section: 'KI' },
    act('KI Ollama OpenRouter Modell Anbieter', 'KI-Einstellungen …', aiDlg),
    { section: 'Datenschutz' },
    { name: 'favicons', label: 'Seiten-Icons laden (Netzwerk)', type: 'checkbox', value: s.favicons },
    permsRow,
  ], { ok: 'Speichern', search: true }).then(async (v) => {
    if (!v) return
    Object.assign(s, { theme: v.theme, accent: v.accent, pitch: v.pitch, view: v.view, galleryMode: v.galleryMode, galleryDensity: v.galleryDensity, font: v.font, discover: v.discover, emptyCol: v.emptyCol, favicons: v.favicons, newtabBar: v.newtabBar, openInNewTab: v.openInNewTab, confirmDelete: v.confirmDelete, hidden: v.hidden.split(',').map((x) => x.trim()).filter(Boolean) })
    pb.exclude = v.pbExclude.trim()
    pb.quick = Number.isFinite(v.quick) ? Math.min(20, Math.max(0, Math.round(v.quick))) : 8
    s.pomo = { work: Math.max(1, Math.round(v.pomoWork) || 25), brk: Math.max(1, Math.round(v.pomoBrk) || 5) }
    s.backup.nagDays = [0, 7, 14, 30].includes(Number(v.nagDays)) ? Number(v.nagDays) : 14
    if (v.device !== undefined) Object.assign(s.backup.folder, { device: v.device.trim(), on: (picked || v.folderOn) && !!dirH })
    Object.assign(bg, { type: v.bgType, preset: v.preset, c1: v.c1, c2: v.c2, intensity: v.intensity, grain: v.grain, parallax: v.parallax })
    await persist(); await applyLook(); syncNewtabBar(); render()
  })
}
async function barsDlg() {
  const v = await ask('Schnellwahl-Leisten', [{ name: 't', label: 'Name ; top|recent|today ; Filter (Regex) ; Anzahl', type: 'textarea', rows: 8, value: barsToText(S.settings.bars) }])
  if (!v) return
  S.settings.bars = parseBars(v.t)
  await persist(); renderBars()
}
// Sicherung einspielen (aus Liste, Datei oder Ordner): erst prüfen, dann bestätigen, dann restore().
async function restoreFlow(b) {
  if (!isBackup(b)) throw new Error('Keine gültige pika-own-Sicherung')
  if (!confirm('Einstellungen ersetzen und fehlende Lesezeichen neu anlegen? (Vorhandene Lesezeichen werden nicht gelöscht)')) return
  importing = true
  try { const r = await restore(b); toast(`Wiederhergestellt, ${r.added} Lesezeichen ergänzt`) } finally { importing = false }
  setTimeout(() => location.reload(), 800)
}
async function backupsDlg() {
  const body = h('div', { class: 'list' })
  const file = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async (e) => {
    try { await doRestore(JSON.parse(await e.target.files[0].text())) } catch (err) { toast('Import fehlgeschlagen: ' + err.message) }
  } })
  const doRestore = restoreFlow
  const draw = async () => {
    const l = await listBackups()
    body.replaceChildren(file, ...(l.length ? l.map((b) => h('div', { class: 'lrow' }, h('span', {}, new Date(b.ts).toLocaleString('de-DE') + ` · ${b.folders.reduce((a, f) => a + f.items.length, 0)} Lesezeichen`), h('button', { onclick: () => doRestore(b) }, 'Wiederherstellen'))) : [h('p', { class: 'muted' }, 'Noch keine Sicherung. Täglich automatisch, die letzten 7 bleiben.')]))
  }
  await draw()
  dialog('Sicherungen', body, [
    { label: 'Jetzt sichern', fn: async () => { await saveBackup(); await draw(); return false } },
    { label: 'Exportieren (Datei)', fn: async () => { await exportBackup(); return false } },
    { label: 'Importieren …', fn: () => { file.click(); return false } }, { label: 'Schließen' }])
}
// Datei-Kopie außerhalb des Profils; merkt sich das Datum für den Hinweis.
async function exportBackup() {
  const b = await makeExport() // ohne API-Schlüssel
  const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(b)], { type: 'application/json' })), download: `pika-own-backup-${new Date().toISOString().slice(0, 10)}.json` })
  a.click()
  S.settings.backup.lastExport = Date.now(); await persist(); renderNag()
}
/* ---------- Sicherungsordner (nur Chromium) ---------- */
let dirH = null, folderPrompt = false // Handle aus IndexedDB; Zugriff nach Neustart abgelaufen
// Schreibt die Tagesdatei und räumt eigene Altdateien auf. ask=true nur aus einem Klick. 'granted' | 'prompt' | 'denied' | 'error' | 'none'
async function folderBackup(ask) {
  if (!dirH) return 'none'
  const p = await bf.access(dirH, ask)
  folderPrompt = p === 'prompt'; renderNag()
  if (p !== 'granted') return p
  const f = S.settings.backup.folder, now = Date.now()
  try {
    await bf.writeSnapshot(dirH, fileName(f.device, now), JSON.stringify(await makeExport()))
    await bf.prune(dirH, toDelete((await bf.listSnapshots(dirH)).map((x) => x.name), f.device, f.keep))
  } catch (e) { if (ask) toast('Sicherung in den Ordner fehlgeschlagen: ' + e.message); else errToastOnce(e); return 'error' } // lastWrite bleibt: der nächste Neue Tab versucht es erneut
  f.lastWrite = now; S.settings.backup.lastExport = now // so schweigt der Hinweis auf eine Sicherungsdatei
  await persist(); renderNag()
  return 'granted'
}
// Fehlerhinweis höchstens einmal je Tag; der Schreibversuch läuft trotzdem bei jedem Neuen Tab.
function errToastOnce(e) {
  try { if (localStorage.getItem('pika_folderErr') === dayKey(Date.now())) return; localStorage.setItem('pika_folderErr', dayKey(Date.now())) } catch {}
  toast('Sicherung in den Ordner fehlgeschlagen: ' + e.message)
}
async function folderStart() {
  if (!bf.supported()) return
  dirH = await bf.loadHandle().catch(() => null)
  const f = S.settings.backup.folder
  if (f.on && dirH && dayKey(f.lastWrite) !== dayKey(Date.now())) await folderBackup(false)
}
// Karte „Sicherung wiederherstellen“ (frisches Profil): Datei wählen (alle Browser) oder aus dem Sicherungsordner (Chromium).
const restoreCard = () => {
  const file = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async (e) => {
    try { const f = e.target.files[0]; checkSize(f.size); await restoreFlow(JSON.parse(await f.text())) } catch (err) { toast('Import fehlgeschlagen: ' + err.message) }
  } })
  const b = S.settings.backup
  return h('div', { class: 'nag', 'data-restore': '1' }, h('span', {}, 'Sicherung wiederherstellen: Board, Einstellungen und fehlende Lesezeichen aus einer Sicherung zurückholen.'), file,
    ...(bf.supported() ? [h('button', { onclick: folderRestoreDlg }, 'Aus Sicherungsordner')] : []),
    h('button', { class: 'primary', onclick: () => file.click() }, 'Datei wählen'),
    h('button', { title: 'Karte 14 Tage nicht mehr zeigen', onclick: async () => { b.nagUntil = Date.now() + NAG_MS; await persist(); renderNag() } }, 'Später'))
}
async function folderRestoreDlg() {
  let d = dirH
  try { d ||= await bf.pick(); if ((await bf.access(d, true)) !== 'granted') return toast('Kein Zugriff auf den Ordner') } catch { return } // Abbruch im Ordnerdialog
  const l = await bf.listSnapshots(d)
  const body = h('div', { class: 'list' }, l.length ? l.map((x) => h('div', { class: 'lrow' }, h('span', {}, `${x.name} · ${new Date(x.ts).toLocaleString('de-DE')}`),
    h('button', { onclick: async () => { try { await restoreFlow(await bf.readSnapshot(d, x.name)) } catch (err) { toast('Import fehlgeschlagen: ' + err.message) } } }, 'Einspielen'))) : h('p', { class: 'muted' }, 'Keine Sicherungsdateien im Ordner.'))
  dialog('Aus Sicherungsordner', body)
}
function renderNag() {
  const b = S.settings.backup
  const card = Date.now() >= (b.nagUntil || 0) && isFreshProfile(countUrls(T[0]), S)
  $('nag').replaceChildren(...(folderPrompt ? [h('div', { class: 'nag' }, h('span', {}, 'Sicherungsordner: Der Browser will den Zugriff nach dem Neustart erneut bestätigen.'),
    h('button', { class: 'primary', onclick: () => folderBackup(true) }, 'Zugriff erneuern'))] : []),
    ...(card ? [restoreCard()] : backupNagDue(b, Date.now()) ? [h('div', { class: 'nag' },
    h('span', {}, b.lastExport ? `Letzte Sicherungsdatei vom ${new Date(b.lastExport).toLocaleDateString('de-DE')}. ` : 'Noch keine Sicherungsdatei außerhalb des Browsers. ', 'Geht das Profil verloren, sind sonst auch die Sicherungen weg.'),
    h('button', { class: 'primary', onclick: exportBackup }, 'Jetzt exportieren'),
    h('button', { title: 'Hinweis 14 Tage nicht mehr zeigen', onclick: async () => { b.nagUntil = Date.now() + NAG_MS; await persist(); renderNag() } }, 'Später'))] : []))
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
// Leiste im Neuen Tab: einmal einbinden, danach nur ein-/ausblenden (Optionen: Leiste).
let barMounted = false
function syncNewtabBar() {
  const on = S.settings.newtabBar !== false
  pikabar.hidden = !on
  if (on && !barMounted) { barMounted = true; PikaBar.mount(pikabar) }
}
function render() { renderHead(); renderNag(); renderPinned(); renderTags(); renderWidgets(); renderBars(); renderBoard() }
// Andere Schreiber (Hintergrund: Erinnerung erledigt, Pomodoro-Phase, Sitzung; Leiste: Live-Ordner): neu laden,
// sonst überschreibt persist() deren Stand. Bei offenem Dialog oder Ziehen nur deren Felder übernehmen (absorb).
// Ungespeicherte Eingabe in einem Widget: Fokus im Feld, Text/Datum im Todo-Feld oder Notiztext, der vom gespeicherten abweicht.
const typing = () => [...document.querySelectorAll('#widgets [data-wid]')].some((box) => {
  const w = S.workspaces.flatMap((x) => x.widgets || []).find((x) => x?.id === box.dataset.wid)
  return [...box.querySelectorAll('input[type=text],input[type=datetime-local],textarea')].some((el) => el === document.activeElement || (el.tagName === 'TEXTAREA' ? el.value !== (w?.text || '') : !!el.value))
})
B.storage.onChanged.addListener(async (ch, area) => {
  const nv = ch.pika?.newValue
  if (area !== 'local' || !nv || !S || own.delete(canon(nv))) return
  if (document.querySelector('dialog[open]') || drag || typing()) return absorb(S, nv, Date.now())
  S = await load(); render()
})
;(async () => {
  S = await load()
  T = await B.bookmarks.getTree(); index()
  await applyLook()
  render()
  if (!S.settings.tourDone && !location.hash) tourStart() // gleich nach dem ersten Zeichnen, damit niemand schon tippt
  histItems = await loadItems()
  renderBars(); renderResume(); if (S.settings.discover) renderBoard()
  syncNewtabBar()
  folderStart() // nicht abwarten: das Board steht schon
  if (location.hash === '#ai') aiDlg()
  for (const ev of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) B.bookmarks[ev].addListener(reloadSoon)
})()
