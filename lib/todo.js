// Reine Helfer für das Todo-Widget und seine Alarme (v0.8), ohne Browser testbar.
// Punkt: { id, t (Text), done, due? (ms, Ortszeit-Zeitpunkt), notified? (Benachrichtigung schon gezeigt) }

export const isOverdue = (i, now) => !i.done && i.due != null && i.due <= now

// Reihenfolge: offen+fällig (nach Datum), offen mit künftigem Datum, offen ohne Datum, erledigt zuletzt. Gibt eine Kopie zurück.
export function sortTodos(items, now) {
  const rank = (i) => (i.done ? 3 : i.due == null ? 2 : i.due <= now ? 0 : 1)
  return [...items].sort((a, b) => rank(a) - rank(b) || (rank(a) < 2 ? a.due - b.due : 0))
}

// Punkte, die jetzt eine Benachrichtigung brauchen: offen, mit Datum, erreicht, noch nicht gemeldet.
export const dueSoon = (items, now) => items.filter((i) => isOverdue(i, now) && !i.notified)

// Alarme für alle Todo-Widgets: nur offene, noch nicht gemeldete Punkte mit Datum, die nächsten max nach Datum.
// shortcut: höchstens 100 Alarme, spätere Punkte folgen, sobald frühere gemeldet sind (die Meldung ändert die Daten und plant neu).
export function planTodoAlarms(workspaces, max = 100) {
  const out = []
  for (const w of (workspaces || []).flatMap((x) => x.widgets || [])) {
    if (w?.type !== 'todo') continue
    for (const i of w.items || []) if (!i.done && i.due != null && !i.notified) out.push({ name: `todo|${w.id}|${i.id}`, wid: w.id, iid: i.id, when: i.due })
  }
  return out.sort((a, b) => a.when - b.when).slice(0, max)
}

// Überfällige, noch nicht gemeldete Punkte aller Todo-Widgets (die Objekte selbst, damit der Aufrufer notified setzen kann).
export const overdueUnnotified = (workspaces, now) => (workspaces || []).flatMap((x) => x.widgets || []).filter((w) => w?.type === 'todo').flatMap((w) => dueSoon(w.items || [], now))
// Ab so vielen überfälligen Punkten gibt es statt Einzelmeldungen eine Sammelmeldung (Browserstart nach langer Pause).
export const BURST = 3
