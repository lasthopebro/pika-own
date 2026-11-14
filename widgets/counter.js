// Zähler: Name, Wert n, Knöpfe − und +.
export default {
  type: 'counter', label: 'Zähler',
  defaults: () => ({ label: '', n: 0 }),
  fields: (d) => [{ name: 'label', label: 'Name', value: d.label }],
  title: (w) => w.label || 'Zähler',
  render(w, { big, box, patch, h }) {
    const upd = () => { big.textContent = w.n }
    upd()
    const step = (d) => async () => { await patch((x) => { x.n = (x.n || 0) + d }); upd() }
    box.append(h('button', { onclick: step(-1) }, '−'), h('button', { onclick: step(1) }, '+'))
  },
}
