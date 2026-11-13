// Leiste auf Webseiten: nur oberster Frame, closed Shadow DOM, Daten über Nachrichten (nie der volle Zustand).
// Wird zur Laufzeit per scripting.registerContentScripts nach lib/bar.js geladen, nur wenn der Nutzer es eingeschaltet hat.
(() => {
  if (window.top !== window || globalThis.__pikaBar || !/html/.test(document.contentType || 'text/html')) return
  globalThis.__pikaBar = true
  const B = globalThis.browser ?? globalThis.chrome
  const de = document.documentElement
  const origMargin = de.style.getPropertyValue('margin-top'), origPrio = de.style.getPropertyPriority('margin-top')
  const host = document.createElement('div')
  host.style.cssText = 'all:initial;position:fixed;top:0;left:0;right:0;z-index:2147483647;display:block'
  const root = host.attachShadow({ mode: 'closed' })
  const wrap = document.createElement('div')
  const handle = document.createElement('button')
  handle.textContent = '▾'; handle.title = 'Leiste ausklappen (Alt+Umschalt+B)'
  handle.style.cssText = 'all:initial;display:block;margin:0 auto;width:40px;height:12px;line-height:12px;text-align:center;font:10px system-ui;background:#1f2937;color:#f3f4f6;border-radius:0 0 6px 6px;cursor:pointer'
  root.append(wrap, handle)
  let collapsed = false, hidden = false
  const apply = () => {
    const px = hidden ? 0 : collapsed ? 12 : 30
    host.style.display = hidden ? 'none' : 'block'
    host.style.height = px + 'px'
    wrap.style.display = collapsed ? 'none' : 'block'
    handle.style.display = collapsed ? 'block' : 'none'
    if (hidden || document.fullscreenElement) de.style.setProperty('margin-top', origMargin, origPrio)
    else de.style.setProperty('margin-top', px + 'px', 'important')
    host.style.display = hidden || document.fullscreenElement ? 'none' : 'block'
  }
  const toggle = () => { collapsed = !collapsed; apply(); B.runtime.sendMessage({ type: 'pbCollapse', v: collapsed }) }
  handle.onclick = toggle
  addEventListener('keydown', (e) => { if (e.altKey && e.shiftKey && e.code === 'KeyB') toggle() })
  document.addEventListener('fullscreenchange', apply)
  de.append(host)
  PikaBar.mount(wrap, { host: location.hostname, onCollapse: toggle, onChange: (d) => { hidden = !!d.hidden; collapsed = !!d.collapsed; apply() } })
})()