// Notiz: mehrzeiliges Textfeld; speichert 500 ms nach der letzten Eingabe, beim Verlassen des Felds und beim Ausblenden/Schließen des Tabs, nur über patch.
// Kein Neuzeichnen beim eigenen Speichern, damit der Cursor bleibt.
export default {
  type: 'notes', label: 'Notiz',
  defaults: () => ({ label: '', text: '' }),
  fields: (d) => [{ name: 'label', label: 'Name', value: d.label }],
  title: (w) => w.label || 'Notiz',
  render(w, { box, patch, h }) {
    let timer
    const save = () => { clearTimeout(timer); if (ta.value !== (w.text || '')) return patch((x) => { x.text = ta.value }) }
    const ta = h('textarea', { rows: 5, 'aria-label': 'Notiz', oninput: () => { clearTimeout(timer); timer = setTimeout(save, 500) }, onblur: save }, w.text || '')
    // Tab wird verlassen oder geschlossen: ausstehenden Text sofort speichern (Listener endet, sobald das Widget neu gezeichnet wurde)
    const flush = () => { if (!box.isConnected) { document.removeEventListener('visibilitychange', onHide); removeEventListener('pagehide', flush) } else save() }
    const onHide = () => { if (document.hidden) flush() }
    document.addEventListener('visibilitychange', onHide); addEventListener('pagehide', flush)
    box.append(ta)
  },
}
