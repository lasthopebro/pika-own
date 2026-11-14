// Datum und Uhrzeit, optional in einer Zeitzone (IANA-Name, leer = lokal).
export default {
  type: 'clock', label: 'Datum & Uhrzeit (Zeitzone)',
  defaults: () => ({ tz: '' }),
  fields: (d) => [{ name: 'tz', label: 'Zeitzone (leer = lokal)', placeholder: 'Asia/Tokyo', value: d.tz }],
  title: (w) => w.tz || 'Lokale Zeit',
  make(v) {
    const tz = (v.tz || '').trim()
    try { if (tz) new Intl.DateTimeFormat('de', { timeZone: tz }) } catch { return 'Unbekannte Zeitzone: ' + v.tz }
    return { tz }
  },
  render(w, { big, sub, tick }) {
    tick(() => {
      try {
        const d = new Date(), tz = w.tz || undefined
        big.textContent = d.toLocaleTimeString('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        sub.textContent = d.toLocaleDateString('de-DE', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short' })
      } catch { big.textContent = 'Zeitzone?' }
    })
  },
}
