// Fotorahmen: bis zu 6 https-Adressen im Wechsel. Gespeichert werden nur Adressen (keine Bilddaten); ein nicht ladbares Bild wird übersprungen.
import { h } from '../lib/ui.js'
import { MAX_PHOTOS, httpsUrl, parsePhotoUrls } from '../lib/photo.js'

const form = (d) => [
  { name: 'urls', label: `Bild-Adressen (https, eine pro Zeile, höchstens ${MAX_PHOTOS})`, type: 'textarea', rows: 6, value: (d.urls || []).join('\n') },
  { name: 'sec', label: 'Wechselzeit (Sekunden)', type: 'number', value: d.sec, min: 3 },
  { name: 'fit', label: 'Darstellung', type: 'select', options: [['contain', 'Einpassen'], ['cover', 'Füllen']], value: d.fit },
  { label: 'Hinweis', node: h('p', { class: 'muted' }, 'Es werden nur die Adressen gespeichert, keine Bilder. Der Server, der ein Bild ausliefert, sieht deine IP-Adresse und den Zeitpunkt.') },
]
// Formularwerte -> Widget-Daten, oder ein Text mit der Fehlermeldung.
const build = (v) => {
  const r = parsePhotoUrls(v.urls)
  return r.error || { urls: r.urls, sec: Math.max(3, v.sec || 30), fit: v.fit === 'cover' ? 'cover' : 'contain' }
}

export default {
  type: 'photo', label: 'Fotorahmen',
  defaults: () => ({ urls: [], sec: 30, fit: 'contain' }),
  fields: form,
  title: () => 'Fotorahmen',
  make: build,
  render(w, { box, tick, patch, ask, toast, icon, redraw }) {
    const urls = (w.urls || []).map(httpsUrl).filter(Boolean).slice(0, MAX_PHOTOS) // auch aus einer importierten Sicherung nur https
    let i = -1, secs = 0, fails = 0, dead = false
    const msg = h('div', { class: 'muted' }, urls.length ? '' : 'Keine Bilder: Stift wählen und Adressen eintragen')
    const show = (k) => { i = k % urls.length; secs = 0; img.src = urls[i] }
    const img = h('img', {
      class: 'photo', alt: 'Foto', referrerpolicy: 'no-referrer', style: { objectFit: w.fit === 'cover' ? 'cover' : 'contain' },
      onload: () => { fails = 0; msg.textContent = '' },
      onerror: () => { if (++fails >= urls.length) { dead = true; msg.textContent = 'Kein Bild ladbar' } else show(i + 1) },
    })
    const edit = async () => {
      const v = await ask('Fotorahmen', form(w))
      if (!v) return
      const m = build(v)
      if (typeof m === 'string') return toast(m)
      await patch((x) => Object.assign(x, m)); redraw()
    }
    if (urls.length) box.append(img)
    box.append(msg, h('button', { title: 'Fotorahmen bearbeiten', 'aria-label': 'Fotorahmen bearbeiten', onclick: edit }, icon('edit')))
    tick(() => { if (!urls.length || dead) return; if (i < 0) show(0); else if (urls.length > 1 && ++secs >= (w.sec || 30)) show(i + 1) })
  },
}
