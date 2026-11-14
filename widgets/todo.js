// Todo: Enter fügt hinzu, Häkchen, Löschen, Fälligkeit optional. Reihenfolge aus lib/todo.js.
// Die Benachrichtigung zur Fälligkeit kommt aus dem Hintergrund (background.js, Alarm todo|<Widget>|<Punkt>), auch ohne offenen Tab.
import { sortTodos, isOverdue } from '../lib/todo.js'

export default {
  type: 'todo', label: 'Todo',
  defaults: () => ({ label: '', items: [] }),
  fields: (d) => [{ name: 'label', label: 'Name', value: d.label }],
  title: (w) => w.label || 'Todo',
  render(w, { box, patch, tick, h }) {
    let sig = ''
    const key = (now) => sortTodos(w.items || [], now).map((i) => i.id + (isOverdue(i, now) ? '!' : '') + (i.done ? 'x' : '')).join()
    const change = async (id, fn) => { await patch((x) => { x.items = (x.items || []).flatMap((i) => (i.id !== id ? [i] : fn(i))) }); draw() }
    const draw = () => {
      const now = Date.now()
      sig = key(now)
      list.replaceChildren(...sortTodos(w.items || [], now).map((i) => h('li', { class: isOverdue(i, now) ? 'over' : i.done ? 'done' : '' },
        h('input', { type: 'checkbox', checked: !!i.done, 'aria-label': 'Erledigt: ' + i.t, onchange: (e) => change(i.id, (p) => [{ ...p, done: e.target.checked }]) }),
        h('span', { class: 'ttext' }, i.t),
        i.due != null ? h('span', { class: 'muted' }, (isOverdue(i, now) ? 'fällig ' : '') + new Date(i.due).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })) : null,
        h('button', { title: 'Löschen', 'aria-label': 'Löschen: ' + i.t, onclick: () => change(i.id, () => []) }, '×'))))
    }
    const add = async () => {
      const t = text.value.trim()
      if (!t) return
      const item = { id: crypto.randomUUID(), t, done: false }
      const d = due.value ? new Date(due.value).getTime() : NaN
      if (!Number.isNaN(d)) item.due = d
      text.value = ''; due.value = ''
      await patch((x) => { (x.items ||= []).push(item) })
      draw()
    }
    const text = h('input', { type: 'text', placeholder: 'Neuer Punkt, Enter', 'aria-label': 'Neuer Punkt', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); add() } } })
    const due = h('input', { type: 'datetime-local', 'aria-label': 'Fällig (optional)' })
    const list = h('ul', { class: 'todo' })
    box.append(text, due, list)
    draw()
    tick(() => { if (key(Date.now()) !== sig) draw() }) // nur neu zeichnen, wenn ein Punkt fällig wird (Klicks gehen nicht verloren)
  },
}
