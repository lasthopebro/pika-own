// Berechtigungs-Wächter: Manifest und docs/BERECHTIGUNGEN.md müssen dieselben Berechtigungen nennen (je mit Begründung).
// Aufruf: node tools/check-permissions.mjs [Manifest] [Tabelle]   Exit 1 bei Abweichung.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'

const KEYS = ['permissions', 'optional_permissions', 'host_permissions', 'optional_host_permissions']
export const manifestPerms = (m) => new Set(KEYS.flatMap((k) => m[k] || []))
// Tabellenzeilen `| name | Begründung |`; Kopf und Trennzeile zählen nicht. Name ohne Backticks.
export function docPerms(md) {
  const out = new Map()
  for (const line of md.split(/\r?\n/)) {
    const m = /^\|\s*`?([^|`]+?)`?\s*\|\s*(.*?)\s*\|\s*$/.exec(line)
    if (m && !/^-+$/.test(m[1]) && m[1] !== 'Berechtigung') out.set(m[1], m[2])
  }
  return out
}
// Liste der Abweichungen (leer = in Ordnung)
export function diff(manifest, md) {
  const a = manifestPerms(manifest), b = docPerms(md), bad = []
  for (const p of a) if (!b.has(p)) bad.push(`Im Manifest, aber nicht in docs/BERECHTIGUNGEN.md: ${p}`)
  for (const [p, why] of b) { if (!a.has(p)) bad.push(`In docs/BERECHTIGUNGEN.md, aber nicht im Manifest: ${p}`); else if (!why) bad.push(`Ohne Begründung: ${p}`) }
  return bad
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const [mf = path.join(root, 'manifest.json'), md = path.join(root, 'docs', 'BERECHTIGUNGEN.md')] = process.argv.slice(2)
  const bad = diff(JSON.parse(fs.readFileSync(mf, 'utf8')), fs.readFileSync(md, 'utf8'))
  if (bad.length) { console.error(bad.join('\n')); process.exit(1) }
  console.log(`Berechtigungen in Ordnung (${manifestPerms(JSON.parse(fs.readFileSync(mf, 'utf8'))).size})`)
}
