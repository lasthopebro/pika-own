import { B } from './lib/api.js'
import { load, save } from './lib/store.js'
import { saveBackup, listBackups } from './lib/backup.js'
import { openTabs, saveSession } from './lib/sessions.js'

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
  const S = await load()
  const m = S.meta[k]
  if (!m?.remind) return
  await B.notifications.create(k, { type: 'basic', iconUrl: B.runtime.getURL('icon128.png'), title: 'pika-own Erinnerung', message: (m.comment || k).slice(0, 200) })
  delete m.remind
  await save(S)
}

async function init() {
  try {
    await B.contextMenus.removeAll()
    B.contextMenus.create({ id: 'save-page', title: 'In pika-own speichern', contexts: ['page', 'link'] })
    B.contextMenus.create({ id: 'save-session', title: 'Alle Tabs als pika-own-Sitzung speichern', contexts: ['page'] })
  } catch {}
  Promise.resolve(B.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })).catch(() => {})
  B.alarms.create('daily-backup', { periodInMinutes: 1440 })
  const last = (await listBackups())[0]
  if (!last || Date.now() - last.ts > 864e5) await saveBackup()
  await syncReminders()
}

B.runtime.onInstalled.addListener(init)
B.runtime.onStartup.addListener(init)
B.action.onClicked.addListener(() => B.sidebarAction?.toggle?.())
B.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'daily-backup') await saveBackup()
  else if (a.name.startsWith('rem|')) await fire(a.name.slice(4))
})
B.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.pika) syncReminders() })
B.notifications.onClicked.addListener((id) => { if (/^https?:/.test(id)) B.tabs.create({ url: id }) })
B.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-page') {
    const url = info.linkUrl || info.pageUrl
    await B.bookmarks.create({ title: info.linkUrl ? info.linkUrl : tab?.title || url, url })
  } else if (info.menuItemId === 'save-session') {
    const S = await load()
    await saveSession(S, 'Sitzung ' + new Date().toLocaleString('de-DE'), await openTabs())
    await save(S)
  }
})
