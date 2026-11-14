import { B } from './lib/api.js'
import { load, update } from './lib/store.js'
import { saveBackup, listBackups } from './lib/backup.js'
import { openTabs, saveSession } from './lib/sessions.js'
import { loadItems } from './lib/dials.js'
import { groupHistory, normUrl, isExcluded } from './lib/logic.js'
import { OPS, liveItems } from './lib/folders.js'
import { timerNext } from './lib/quick.js'

const note = (id, message) => B.notifications.create(id, { type: 'basic', iconUrl: B.runtime.getURL('icon128.png'), title: 'pika-own', message: message.slice(0, 200) })

// Timer/Pomodoro: der Wecker läuft hier, damit er auch ohne offenen Neuen Tab klingelt.
async function timerDone(id) {
  await update((S) => {
    const w = S.workspaces.flatMap((x) => x.widgets).find((x) => x.id === id)
    if (!w?.until) return
    if (w.until > Date.now() + 1000) return void B.alarms.create('timer|' + id, { when: w.until }) // veralteter/zu früher Alarm
    note('timer|' + id, timerNext(w, Date.now()))
    if (w.until) B.alarms.create('timer|' + id, { when: w.until })
  })
}

// Alle http(s)-Tabs des Fensters als neuen Lesezeichen-Ordner („Weitere Lesezeichen“).
async function saveTabsFolder() {
  const tabs = await openTabs()
  if (!tabs.length) return { n: 0 }
  const f = await B.bookmarks.create({ title: 'Tabs ' + new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) })
  try { for (const t of tabs) await B.bookmarks.create({ parentId: f.id, title: t.title || t.url, url: t.url }) } catch (e) { await B.bookmarks.removeTree(f.id).catch(() => {}); throw e } // kein halber Ordner
  return { id: f.id, title: f.title, n: tabs.length }
}
// Alarme überleben einen Browser-Neustart nicht sicher: laufende Timer neu stellen, abgelaufene nachholen.
async function syncTimers() {
  for (const w of (await load()).workspaces.flatMap((x) => x.widgets)) {
    if (w.type !== 'timer' || !w.until) continue
    if (w.until <= Date.now()) await timerDone(w.id); else B.alarms.create('timer|' + w.id, { when: w.until })
  }
}

// Live-Ordner als Tab-Gruppe: offene Tabs werden wiederverwendet (kein Duplikat), fehlende im Hintergrund geöffnet.
async function folderGroup(id) {
  const f = (await load()).lf.find((x) => x.id === id)
  if (!f?.items.length || !B.tabs.group) return false
  // nur nicht angeheftete Tabs dieses Fensters wiederverwenden (angeheftete lassen sich nicht gruppieren)
  const open = (await openTabs()).filter((t) => !t.pinned), ids = new Set()
  for (const i of f.items) ids.add((open.find((t) => normUrl(t.url) === normUrl(i.u)) || (await B.tabs.create({ url: i.u, active: false }))).id)
  const gid = await B.tabs.group({ tabIds: [...ids] })
  await Promise.resolve(B.tabGroups?.update(gid, { title: `${f.icon} ${f.name}` })).catch(() => {})
  return true
}

async function syncReminders() {
  for (const a of await B.alarms.getAll()) if (a.name.startsWith('rem|')) await B.alarms.clear(a.name)
  const S = await load()
  for (const [k, m] of Object.entries(S.meta)) {
    if (!m.remind) continue
    if (m.remind <= Date.now()) await fire(k)
    else B.alarms.create('rem|' + k, { when: m.remind })
  }
}

async function fire(k) {
  await update(async (S) => {
    const m = S.meta[k]
    if (!m?.remind) return
    await B.notifications.create(k, { type: 'basic', iconUrl: B.runtime.getURL('icon128.png'), title: 'pika-own Erinnerung', message: (m.comment || k).slice(0, 200) })
    delete m.remind
  })
}

/* ---------- Leiste: Daten und Aktionen für Neuer Tab und Webseiten ---------- */
let quickCache = { ts: 0, items: [] }
async function historyItems() {
  if (Date.now() - quickCache.ts > 60e3) quickCache = { ts: Date.now(), items: await loadItems() }
  return quickCache.items
}
// Jeder Tab mit Leiste fragt bei jeder Tab-Änderung an: Baum nur neu lesen, wenn sich Lesezeichen geändert haben.
let bmCache = null
for (const ev of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) B.bookmarks[ev].addListener(() => { bmCache = null })
const bookmarkBar = () => (bmCache ??= readBookmarkBar().catch((e) => { bmCache = null; throw e }))
async function readBookmarkBar() {
  const [root] = await B.bookmarks.getTree()
  const bar = root.children.find((c) => c.id === '1' || c.id === 'toolbar_____') || root.children[0]
  const links = [], folders = []
  for (const c of (bar?.children || []).slice(0, 60)) {
    if (c.url) links.push({ t: c.title || c.url, u: c.url })
    else folders.push({ id: 'bm:' + c.id, name: c.title || 'Ordner', icon: '📂', ro: true, items: (c.children || []).filter((x) => x.url).slice(0, 40).map((x) => ({ u: x.url, t: x.title || x.url })) })
  }
  return { links, folders }
}
const httpTabs = async () => (await B.tabs.query({})).filter((t) => /^https?:/.test(t.url || ''))
async function getBar(m) {
  const S = await load()
  const pb = S.settings.pagebar
  if (m.host && isExcluded(m.host, pb.exclude)) return { hidden: true }
  const tabs = await httpTabs()
  const bm = await bookmarkBar()
  const quick = groupHistory(await historyItems(), { mode: 'top', limit: pb.quick, now: Date.now(), hidden: S.settings.hidden }).map((g) => ({ t: g.domain, u: g.subs[0].url }))
  return {
    folders: [...S.lf.map((f) => ({ ...f, items: liveItems(f, tabs) })), ...bm.folders],
    bm: bm.links, quick, tabs: tabs.slice(0, 30).map((t) => ({ t: t.title, u: t.url })), collapsed: pb.collapsed, groups: !!B.tabs.group,
  }
}
async function focusOrOpen(url, background) {
  const n = normUrl(url)
  const t = (await httpTabs()).find((x) => normUrl(x.url) === n)
  if (t && !background) { await B.tabs.update(t.id, { active: true }); await B.windows.update(t.windowId, { focused: true }) } else if (!t) await B.tabs.create({ url, active: !background })
}
// Leiste auf Webseiten: nur registriert, wenn eingeschaltet, und nur für Seiten, auf die die Erweiterung Zugriff hat.
async function syncPageBar() {
  const { pagebar } = (await load()).settings
  try { await B.scripting.unregisterContentScripts({ ids: ['pika-bar'] }) } catch {}
  if (!pagebar.on) return
  const { origins = [] } = await B.permissions.getAll()
  const matches = origins.some((o) => o === '<all_urls>' || o === '*://*/*') ? ['<all_urls>'] : origins.filter((o) => /^(https?|\*):/.test(o))
  if (matches.length) await B.scripting.registerContentScripts([{ id: 'pika-bar', matches, js: ['lib/bar.js', 'content/bar.js'], runAt: 'document_idle', persistAcrossSessions: true }])
}
// Seitenzugriff im Add-on-Manager geändert: Leiste sofort neu registrieren statt erst nach Neustart.
for (const ev of ['onAdded', 'onRemoved']) B.permissions?.[ev]?.addListener(() => syncPageBar().catch(() => {}))

async function handle(m, sender) {
  switch (m?.type) {
    case 'getBar': return getBar(m)
    case 'open':
      if (!/^https?:|^about:|^chrome:|^moz-extension:|^chrome-extension:/.test(m.url)) return
      return m.newTab || !sender.tab ? B.tabs.create({ url: m.url }) : B.tabs.update(sender.tab.id, { url: m.url })
    case 'focusOrOpen': if (/^https?:/.test(m.url)) await focusOrOpen(m.url, m.background); return true
    case 'lf': if (OPS[m.op]) await update((S) => OPS[m.op](S, ...m.args)); return true
    case 'folderSession':
      await update((S) => { const f = S.lf.find((x) => x.id === m.id); if (f) return saveSession(S, f.name, f.items.map((i) => ({ title: i.t, url: i.u }))) })
      return true
    case 'pagebar': await syncPageBar(); return true
    case 'pbCollapse': await update((S) => { S.settings.pagebar.collapsed = !!m.v }); return true
    case 'openAi': return B.tabs.create({ url: B.runtime.getURL('newtab.html#ai') })
    case 'saveTabsFolder': return saveTabsFolder()
    case 'folderGroup': return folderGroup(m.id)
  }
}
B.runtime.onMessage.addListener((m, sender, send) => {
  if (!m?.type) return
  handle(m, sender).then(send, (e) => send({ error: String(e) }))
  return true
})
let bc
const broadcast = () => { clearTimeout(bc); bc = setTimeout(async () => { for (const t of await httpTabs()) B.tabs.sendMessage(t.id, { type: 'tabsChanged' }).catch(() => {}) }, 400) }
for (const ev of ['onCreated', 'onRemoved']) B.tabs[ev].addListener(broadcast)
B.tabs.onUpdated.addListener((id, ch) => { if (ch.url || ch.status === 'complete') broadcast() })
async function init() {
  try {
    await B.contextMenus.removeAll()
    B.contextMenus.create({ id: 'save-page', title: 'In pika-own speichern', contexts: ['page', 'link'] })
    B.contextMenus.create({ id: 'save-session', title: 'Alle Tabs als pika-own-Sitzung speichern', contexts: ['page'] })
    B.contextMenus.create({ id: 'save-tabs-folder', title: 'Alle Tabs als Lesezeichen-Ordner speichern', contexts: ['page'] })
  } catch {}
  Promise.resolve(B.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })).catch(() => {})
  B.alarms.create('daily-backup', { periodInMinutes: 1440 })
  const last = (await listBackups())[0]
  if (!last || Date.now() - last.ts > 864e5) await saveBackup()
  await syncReminders()
  await syncTimers().catch(() => {})
  await syncPageBar().catch(() => {})
}

B.runtime.onInstalled.addListener(init)
B.runtime.onStartup.addListener(init)
B.action.onClicked.addListener(() => B.sidebarAction?.toggle?.())
B.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'daily-backup') await saveBackup()
  else if (a.name.startsWith('rem|')) await fire(a.name.slice(4))
  else if (a.name.startsWith('timer|')) await timerDone(a.name.slice(6))
})
// Erinnerungs-Wecker nur neu stellen, wenn sich meta (Erinnerungen) geändert hat, nicht bei jedem Klick.
B.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.pika && JSON.stringify(ch.pika.oldValue?.meta) !== JSON.stringify(ch.pika.newValue?.meta)) syncReminders() })
B.notifications.onClicked.addListener((id) => { if (/^https?:/.test(id)) B.tabs.create({ url: id }) })
B.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-page') {
    const url = info.linkUrl || info.pageUrl
    const b = await B.bookmarks.create({ title: info.linkUrl ? info.linkUrl : tab?.title || url, url })
    const [p] = await B.bookmarks.get(b.parentId).catch(() => [])
    note('saved|' + b.id, `Gespeichert in „${p?.title || 'Lesezeichen'}“: ${b.title}`)
  } else if (info.menuItemId === 'save-tabs-folder') {
    const r = await saveTabsFolder()
    note('saved|tabs', r.n ? `${r.n} Tabs gespeichert in „${r.title}“` : 'Keine http(s)-Tabs in diesem Fenster')
  } else if (info.menuItemId === 'save-session') {
    const tabs = await openTabs()
    await update((S) => saveSession(S, 'Sitzung ' + new Date().toLocaleString('de-DE'), tabs))
  }
})
