// Timer und Pomodoro. Zustand als Zeitstempel (until = läuft bis, left = Rest in s bei Pause): überlebt geschlossene Tabs;
// Wecker (Alarm timer|<id>) und Benachrichtigung laufen im Hintergrund (background.js, lib/quick.js).
import { B } from '../lib/api.js'
import { timerLeft } from '../lib/quick.js'

export default {
  type: 'timer', label: 'Timer',
  defaults: (S) => ({ minutes: S?.settings?.pomo?.work ?? 25, pomo: false, brk: S?.settings?.pomo?.brk ?? 5, phase: 'work' }),
  fields: (d) => [
    { name: 'minutes', label: 'Minuten', type: 'number', value: d.minutes, min: 1 },
    { name: 'pomo', label: 'Pomodoro (Arbeit und Pause im Wechsel)', type: 'checkbox', value: d.pomo },
    { name: 'brk', label: 'Pause (Minuten)', type: 'number', value: d.brk, min: 1 },
  ],
  title: (w) => (w.pomo ? `Pomodoro ${w.minutes}/${w.brk || 5} min` : 'Timer ' + w.minutes + ' min'),
  make: (v) => ({ minutes: Math.max(1, v.minutes || 25), pomo: v.pomo, brk: Math.max(1, v.brk || 5), phase: 'work' }),
  render(w, { big, sub, box, patch, tick, h }) {
    const show = () => {
      const l = timerLeft(w, Date.now())
      big.textContent = `${String(Math.floor(l / 60)).padStart(2, '0')}:${String(l % 60).padStart(2, '0')}`
      sub.textContent = (w.pomo ? (w.phase === 'break' ? 'Pause' : 'Arbeiten') : '') + (w.until ? '' : ' · angehalten')
    }
    tick(show)
    const set = async (fn) => {
      const x = await patch(fn)
      if (!x) return
      await B.alarms.clear('timer|' + w.id)
      if (x.until) B.alarms.create('timer|' + w.id, { when: x.until })
      show()
    }
    box.append(
      h('button', { onclick: () => set((x) => { const l = timerLeft(x, Date.now()); if (x.until) { x.left = l; delete x.until } else { x.until = Date.now() + (l || x.minutes * 60) * 1000; delete x.left } }) }, 'Start/Pause'),
      h('button', { onclick: () => set((x) => { delete x.until; delete x.left; x.phase = 'work' }) }, 'Reset'))
  },
}
