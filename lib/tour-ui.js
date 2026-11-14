// Oberfläche der Erste-Schritte-Tour: modaler Dialog (Fokusfalle, Esc und Tastatur vom Dialog), Ring um das Ziel.
// Schreibt nichts: onEnd() läuft genau einmal bei Ende, „Überspringen“ oder Esc; der Aufrufer merkt sich das Ergebnis.
import { h } from './ui.js'
import { STEPS, next } from './tour.js'

// Ziel nur, wenn sichtbar und bedienbar (nicht hinter einer Galerie oder leer).
const shown = (sel) => { const el = document.querySelector(sel); return el && !el.closest('[inert]') && el.getClientRects().length ? el : null }

export function runTour(onEnd, steps = STEPS) {
  const exists = (sel) => !!shown(sel)
  let cur = next(0, steps, exists), pos = 0, done = false
  if (cur == null) return onEnd()
  const total = steps.filter((s) => exists(s.sel)).length
  const opener = document.activeElement
  const count = h('p', { class: 'muted', role: 'status' }), title = h('h3', { id: 'tour-title' }), text = h('p', { id: 'tour-text' })
  const ring = h('div', { class: 'tour-ring', 'aria-hidden': 'true' })
  const end = () => {
    if (done) return
    done = true
    removeEventListener('resize', place)
    if (dlg.open) dlg.close()
    dlg.remove()
    ;(opener?.isConnected && opener !== document.body ? opener : document.querySelector('#top .search'))?.focus()
    onEnd()
  }
  const go = h('button', { type: 'button', class: 'primary', onclick: () => step() }, 'Weiter')
  const dlg = h('dialog', { class: 'dlg tour', 'aria-labelledby': 'tour-title', 'aria-describedby': 'tour-text' }, ring, count, title, text,
    h('div', { class: 'btns' }, h('button', { type: 'button', onclick: end }, 'Überspringen'), go))
  // Esc selbst behandeln: der Browser löst nach seinem eigenen Schließen den Fokus und überschreibt den zurückgegebenen.
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); end() } })
  dlg.addEventListener('close', end)
  function place() {
    const el = shown(steps[cur].sel)
    if (!el) return
    const r = el.getBoundingClientRect(), pad = 4
    Object.assign(ring.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + 2 * pad + 'px', height: r.height + 2 * pad + 'px' })
    const below = r.bottom + 14
    dlg.style.left = Math.max(8, Math.min(r.left, innerWidth - dlg.offsetWidth - 8)) + 'px'
    dlg.style.top = (below + dlg.offsetHeight + 8 <= innerHeight ? below : Math.max(8, r.top - dlg.offsetHeight - 14)) + 'px'
  }
  function draw() {
    const s = steps[cur]
    shown(s.sel)?.scrollIntoView({ block: 'nearest' })
    count.textContent = `Schritt ${pos + 1} von ${total}`
    title.textContent = s.title; text.textContent = s.text
    go.textContent = next(cur + 1, steps, exists) == null ? 'Fertig' : 'Weiter'
    place()
  }
  function step() {
    const n = next(cur + 1, steps, exists)
    if (n == null) return end()
    cur = n; pos++
    draw(); go.focus()
  }
  addEventListener('resize', place)
  document.body.append(dlg)
  dlg.showModal()
  draw(); go.focus()
}
