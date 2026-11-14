// Countdown bis zu einem Zeitpunkt (datetime-local, Ortszeit).
export default {
  type: 'countdown', label: 'Countdown',
  defaults: () => ({ label: '', to: '' }),
  fields: (d) => [{ name: 'label', label: 'Name', value: d.label }, { name: 'to', label: 'Ziel', type: 'datetime-local', value: d.to }],
  title: (w) => w.label || 'Countdown',
  make: (v) => (v.to ? { label: v.label, to: v.to } : 'Ziel fehlt'),
  render(w, { big, sub, tick }) {
    tick(() => {
      const s = Math.max(0, Math.floor((new Date(w.to) - Date.now()) / 1000))
      big.textContent = `${Math.floor(s / 86400)}d ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      sub.textContent = new Date(w.to).toLocaleString('de-DE')
    })
  },
}
