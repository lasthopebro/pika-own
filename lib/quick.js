// Reine Helfer für v0.5.2 (Einfügen, Timer/Pomodoro, Sicherungs-Hinweis), ohne Browser testbar.

// Alle http(s)-Adressen aus Text oder text/uri-list (Zeilen mit # sind Kommentare). Andere Schemata nie.
export function urlsFromText(text = '') {
  const out = []
  for (const line of String(text).split(/\r?\n/)) {
    const s = line.trim()
    if (!s || s.startsWith('#')) continue
    for (const m of s.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
      try { const u = new URL(m[0]).href; if (!out.includes(u)) out.push(u) } catch {}
    }
  }
  return out
}

// Timer-Widget: { minutes, pomo, brk, phase: 'work'|'break', until (ms, läuft) | left (s, pausiert) }
export const timerMinutes = (w) => (w.phase === 'break' ? w.brk || 5 : w.minutes)
export const timerLeft = (w, now) => (w.until ? Math.max(0, Math.ceil((w.until - now) / 1000)) : w.left ?? timerMinutes(w) * 60)

// Phase zu Ende: Pomodoro startet die nächste Phase, ein einfacher Timer hält an. Liefert den Benachrichtigungstext.
export function timerNext(w, now) {
  delete w.left
  if (!w.pomo) { delete w.until; w.phase = 'work'; return `Timer abgelaufen: ${w.minutes} min` }
  w.phase = w.phase === 'break' ? 'work' : 'break'
  w.until = now + timerMinutes(w) * 60e3
  return w.phase === 'break' ? `Pomodoro: ${w.minutes} min geschafft, ${w.brk || 5} min Pause` : 'Pomodoro: Pause vorbei, weiter geht’s'
}

// Bei offenem Dialog nicht neu laden, sondern nur übernehmen, was Hintergrund und Leiste schreiben:
// Sitzungen, Live-Ordner, erledigte (fällige) Erinnerungen, Timer-Stand, eingeklappte Leiste. Rest bleibt lokal.
export function absorb(S, nv, now) {
  S.sessions = nv.sessions ?? S.sessions
  S.lf = nv.lf ?? S.lf
  S.snapshots = nv.snapshots ?? S.snapshots
  if (nv.settings?.pagebar) S.settings.pagebar.collapsed = nv.settings.pagebar.collapsed
  for (const [k, m] of Object.entries(S.meta)) if (m.remind && m.remind <= now && !nv.meta?.[k]?.remind) delete m.remind
  const theirs = new Map((nv.workspaces || []).flatMap((w) => w.widgets || []).map((w) => [w.id, w]))
  for (const w of S.workspaces.flatMap((x) => x.widgets)) {
    const t = theirs.get(w.id)
    if (t?.type === 'timer') for (const f of ['until', 'left', 'phase']) f in t ? (w[f] = t[f]) : delete w[f]
  }
}

// Hinweis auf eine Kopie außerhalb des Profils: nach nagDays Tagen ohne Export (Standard 14, 0 = nie), außer er wurde gerade geschlossen.
export const NAG_MS = 14 * 864e5
export const backupNagDue = (b = {}, now) => (b.nagDays ?? 14) > 0 && now >= (b.nagUntil || 0) && now - (b.lastExport || 0) > (b.nagDays ?? 14) * 864e5
