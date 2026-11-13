// Seitenleiste mit eigenen, frei anlegbaren Ansichten (Ordner, Tag, Verlauf-Leisten, Tabs, Suche, Sitzungen, eigene Links).
import { B } from './lib/api.js'
import { load, save } from './lib/store.js'
import { h, ask, toast, tile } from './lib/ui.js'
import { domainOf, groupHistory, score } from './lib/logic.js'
import { loadItems } from './lib/dials.js'
import { openSession } from './lib/sessions.js'

const DEFAULT_VIEWS = [
  { id: 'd-lf', name: 'Live-Ordner', type: 'livefolders' }, { id: 'd-today', name: 'Heute', type: 'today' }, { id: 'd-top', name: 'Meistbesucht', type: 'top' },
  { id: 'd-tabs', name: 'Tabs', type: 'tabs' }, { id: 'd-search', name: 'Suche', type: 'search' }, { id: 'd-ses', name: 'Sitzungen', type: 'sessions' },
]
const TYPES = [['folder', 'Lesezeichen-Ordner'], ['tag', 'Tag'], ['top', 'Meistbesucht (Verlauf)'], ['recent', 'Zuletzt besucht (Verlauf)'], ['today', 'Heute besucht (Verlauf)'], ['tabs', 'Offene Tabs'], ['search', 'Lesezeichen-Suche'], ['sessions', 'Sitzungen'], ['links', 'Eigene Links'], ['livefolders', 'Live-Ordner und Leiste']]
let S, T, cur = localStorage.getItem('pika-view') || '', lfEl = null
const $ = (id) => document.getElementById(id)
const views = () => (S.views.length ? S.views : DEFAULT_VIEWS)
const flat = (n) => (n.url ? [n] : (n.children || []).flatMap(flat))

async function open(url, e) {
  if (e?.ctrlKey || e?.button === 1 || e?.metaKey) return B.tabs.create({ url })
  const [t] = await B.tabs.query({ active: true, currentWindow: true })
  t ? B.tabs.update(t.id, { url }) : B.tabs.create({ url })
}
const link = (title, url, sub) => h('a', { class: 'item', href: url, title: url, onclick: (e) => { e.preventDefault(); open(url, e) }, onauxclick: (e) => { e.preventDefault(); open(url, e) } },
  tile(domainOf(url), S.settings.favicons), h('span', { class: 't' }, title || url), sub ? h('span', { class: 'muted' }, sub) : null)
const muted = (t) => h('p', { class: 'muted' }, t)
function nodeList(n) {
  return (n.children || []).map((c) => (c.url ? link(c.title, c.url) : h('details', { open: true }, h('summary', {}, '📁 ' + (c.title || 'Ordner')), h('div', { style: { marginLeft: '10px' } }, nodeList(c)))))
}

async function renderView() {
  const v = views().find((x) => x.id === cur) || views()[0]
  cur = v.id
  const body = $('body')
  body.replaceChildren()
  if (v.type === 'livefolders') {
    // Dieselbe Leiste wie im Neuen Tab, senkrecht; einmal einbinden, sie lädt sich bei Änderungen selbst neu.
    if (!lfEl) { lfEl = h('div'); globalThis.PikaBar.mount(lfEl, { vertical: true }) }
    body.append(lfEl)
  } else if (v.type === 'folder') {
    const f = (function find(n) { return n.id === v.arg ? n : (n.children || []).map(find).find(Boolean) })(T[0])
    const rows = f ? nodeList(f) : []
    body.append(...(rows.length ? rows : [muted(f ? 'Ordner ist leer' : 'Ordner nicht gefunden')]))
  } else if (v.type === 'tag') {
    const u = flat(T[0]).filter((n) => (S.meta[n.url]?.tags || []).includes(v.arg))
    body.append(...(u.length ? u.map((n) => link(n.title, n.url)) : [muted('Keine Lesezeichen mit diesem Tag')]))
  } else if (['top', 'recent', 'today'].includes(v.type)) {
    const g = groupHistory(await loadItems(), { mode: v.type, filter: v.arg || '', limit: 30, now: Date.now(), hidden: S.settings.hidden })
    body.append(...(g.length ? g.map((d) => h('details', {}, h('summary', {}, tile(d.domain, S.settings.favicons), ' ' + d.domain, h('span', { class: 'muted' }, ` ${d.visits}`)), d.subs.slice(0, 10).map((s) => link(s.title, s.url, s.visits)))) : [muted('Keine Treffer im Verlauf')]))
  } else if (v.type === 'tabs') {
    const tabs = await B.tabs.query({ currentWindow: true })
    body.append(...tabs.map((t) => h('div', { class: 'lrow item', style: { cursor: 'pointer' }, onclick: () => B.tabs.update(t.id, { active: true }) },
      tile(domainOf(t.url || ''), false), h('span', { class: 't' }, t.title || t.url), h('button', { class: 'ico', onclick: (e) => { e.stopPropagation(); B.tabs.remove(t.id) } }, '✕'))))
  } else if (v.type === 'search') {
    const res = h('div'), all = flat(T[0])
    const input = h('input', { placeholder: 'Lesezeichen suchen …', style: { width: '100%' }, oninput: () => {
      const q = input.value
      res.replaceChildren(...all.map((n) => ({ n, s: score(q, `${n.title} ${n.url}`) })).filter((x) => q && x.s).sort((a, b) => b.s - a.s).slice(0, 40).map(({ n }) => link(n.title, n.url)))
    } })
    body.append(input, res); input.focus()
  } else if (v.type === 'sessions') {
    body.append(...(S.sessions.length ? S.sessions.map((s) => h('div', { class: 'lrow' }, h('span', {}, `${s.name} · ${s.tabs.length}`), h('button', { onclick: () => openSession(s) }, 'Öffnen'))) : [muted('Noch keine Sitzungen (im Board: ⏱)')]))
  } else if (v.type === 'links') {
    const rows = (v.arg || '').split('\n').map((l) => l.split(';').map((s) => s.trim())).filter((p) => /^https?:/.test(p[1] || ''))
    body.append(...(rows.length ? rows.map(([t, u]) => link(t, u)) : [muted('Keine Links. ✎ → Zeilen „Titel ; https://…“')]))
  }
}

function head() {
  const sel = h('select', { onchange: (e) => { cur = e.target.value; localStorage.setItem('pika-view', cur); renderView() } },
    views().map((v) => h('option', { value: v.id, selected: v.id === cur }, v.name)))
  $('sidehead').replaceChildren(sel, h('button', { class: 'ico', title: 'Neue Ansicht', onclick: () => edit(null) }, '＋'), h('button', { class: 'ico', title: 'Ansicht bearbeiten', onclick: () => edit(views().find((v) => v.id === cur)) }, '✎'))
}

async function edit(v) {
  const a = await ask(v ? 'Ansicht bearbeiten' : 'Neue Ansicht', [
    { name: 'name', label: 'Name', value: v?.name || '' },
    { name: 'type', label: 'Typ', type: 'select', value: v?.type || 'folder', options: TYPES },
    ...(v ? [{ name: 'del', label: 'Ansicht löschen', type: 'checkbox' }] : [])])
  if (!a) return
  if (S.views.length === 0) S.views = DEFAULT_VIEWS.map((x) => ({ ...x }))
  if (v && a.del) {
    S.views = S.views.filter((x) => x.id !== v.id)
  } else {
    let arg = v?.arg || ''
    if (a.type === 'folder') {
      const fs = []; (function w(n, p) { for (const c of n.children || []) if (!c.url) { fs.push([c.id, [...p, c.title].join(' / ')]); w(c, [...p, c.title]) } })(T[0], [])
      const r = await ask('Ordner', [{ name: 'a', label: 'Ordner', type: 'select', value: arg, options: fs }]); if (!r) return; arg = r.a
    } else if (a.type === 'tag') {
      const r = await ask('Tag', [{ name: 'a', label: 'Tag', type: 'select', value: arg, options: Object.keys(S.tags).length ? Object.keys(S.tags) : [''] }]); if (!r) return; arg = r.a
    } else if (['top', 'recent', 'today'].includes(a.type)) {
      const r = await ask('Domain-Filter', [{ name: 'a', label: 'Regex (leer = alle)', value: arg, placeholder: 'github|gitlab' }]); if (!r) return; arg = r.a
    } else if (a.type === 'links') {
      const r = await ask('Eigene Links', [{ name: 'a', label: 'Titel ; URL (eine pro Zeile)', type: 'textarea', rows: 8, value: arg }]); if (!r) return; arg = r.a
    }
    const nv = { id: v?.id || crypto.randomUUID(), name: a.name.trim() || 'Ansicht', type: a.type, arg }
    S.views = v ? S.views.map((x) => (x.id === v.id ? nv : x)) : [...S.views, nv]
    cur = nv.id
  }
  await save(S); toast('Gespeichert'); head(); renderView()
}

async function boot() {
  S = await load(); T = await B.bookmarks.getTree()
  head(); renderView()
}
boot()
B.storage.onChanged.addListener((c, area) => { if (area === 'local' && c.pika) boot() })
for (const ev of ['onCreated', 'onRemoved', 'onUpdated', 'onActivated']) B.tabs[ev].addListener(() => { if (views().find((v) => v.id === cur)?.type === 'tabs') renderView() })
for (const ev of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) B.bookmarks[ev].addListener(async () => { T = await B.bookmarks.getTree() })
