// Berechtigungsseite (Einstellungen → Datenschutz): Liste aus dem laufenden Manifest, Status aus permissions.contains, Widerruf nur für optionale.
// Hält keine zweite Liste: Namen und optional/Pflicht kommen aus manifest, Klartext aus lib/perms-info.js.
import { h } from './ui.js'
import { INFO, entries } from './perms-info.js'

// manifest = runtime.getManifest(), perms = permissions-API, onRevoke(eintrag) nach erfolgreichem Widerruf.
export function permsNode({ manifest, perms, onRevoke }) {
  const rows = entries(manifest)
  const list = h('div', { class: 'list perms' }), msg = h('p', { class: 'muted', role: 'status' })
  const req = (e) => (e.host ? { origins: [e.name] } : { permissions: [e.name] })
  const has = (e) => Promise.resolve().then(() => perms.contains(req(e))).catch(() => false) // dem Browser unbekannte Namen: nicht erteilt
  async function paint() {
    const st = await Promise.all(rows.map(has))
    list.replaceChildren(...rows.map((e, i) => h('div', { class: 'lrow prow', 'data-perm': e.name, 'data-granted': String(st[i]) },
      h('span', {}, h('code', {}, e.name), ' ', INFO[e.name] || ''),
      h('span', { class: 'muted pstat' }, `${e.optional ? 'optional' : 'nötig'}, ${st[i] ? 'erteilt' : 'nicht erteilt'}`),
      st[i] && e.optional ? h('button', { type: 'button', 'aria-label': `Berechtigung ${e.name} widerrufen`, onclick: (ev) => revoke(e, ev.currentTarget) }, 'Widerrufen') : null)))
  }
  async function revoke(e, b) {
    b.disabled = true
    try {
      if ((await perms.remove(req(e))) === false) msg.textContent = `„${e.name}“ wurde nicht widerrufen (der Browser lehnt es ab).`
      else { msg.textContent = `„${e.name}“ widerrufen.`; await onRevoke?.(e) }
    } catch (err) { msg.textContent = `„${e.name}“ nicht widerrufen: ${err.message}` }
    await paint()
  }
  paint()
  return h('details', { class: 'permbox' }, h('summary', {}, `Berechtigungen anzeigen (${rows.length})`),
    h('p', { class: 'muted' }, 'Das darf diese Erweiterung. Optionale lassen sich hier widerrufen; nötige gehören zur Erweiterung und haben keinen Knopf.'), list, msg)
}
