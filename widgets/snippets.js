// Textbausteine: ein Knopf je Zeile kopiert den Text; der Stift bearbeitet die Liste.
const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean)
export default {
  type: 'snippets', label: 'Textbausteine',
  defaults: () => ({ items: [] }),
  fields: (d) => [{ name: 'items', label: 'Einer pro Zeile', type: 'textarea', rows: 5, value: (d.items || []).join('\n') }],
  title: () => 'Textbausteine',
  make: (v) => ({ items: lines(v.items) }),
  render(w, { box, patch, h, toast, ask, icon, redraw }) {
    const edit = async () => {
      const v = await ask('Textbausteine', [{ name: 'items', label: 'Einer pro Zeile', type: 'textarea', rows: 6, value: w.items.join('\n') }])
      if (v) { await patch((x) => { x.items = lines(v.items) }); redraw() }
    }
    box.append(...(w.items || []).map((t) => h('button', { onclick: () => { navigator.clipboard.writeText(t); toast('Kopiert') } }, t.slice(0, 28))),
      h('button', { title: 'Textbausteine bearbeiten', 'aria-label': 'Textbausteine bearbeiten', onclick: edit }, icon('edit')))
  },
}
