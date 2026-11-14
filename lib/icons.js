// Eigener Symbolsatz: einfache Strich-Symbole (24x24, Textfarbe). Klassisches Skript ohne Importe,
// damit Neuer Tab, Seitenleiste und Content-Script (Leiste auf Webseiten) dieselbe Datei laden. Nichts kommt aus dem Netz.
(() => {
  const P = {
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5',
    select: 'M4 4h16v16H4zM8 12l3 3 5-6',
    view: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    save: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    ai: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    widget: 'M4 4h16v16H4zM4 10h16M10 10v10',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    folder: 'M3 6h6l2 2h10v11H3z',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    copy: 'M9 9h11v11H9zM5 15V4h11',
    window: 'M3 5h18v14H3zM3 9h18',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z',
    pin: 'M9 4h6l-1 6 3 3H7l3-3zM12 13v8',
    right: 'M9 5l7 7-7 7',
    back: 'M15 5l-7 7 7 7',
    up: 'M5 15l7-7 7 7',
    down: 'M5 9l7 7 7-7',
    close: 'M6 6l12 12M18 6L6 18',
    undo: 'M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12',
    keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
    tag: 'M3 12V4h8l10 10-8 8zM7 8h.01',
    bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
    palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.5-2.5H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z',
  }
  const NS = 'http://www.w3.org/2000/svg'
  // 24 Emoji für Live-Ordner und Lesezeichen-Symbole.
  const EMOJI = ['📁', '📂', '⭐', '🔥', '💡', '📚', '🎯', '🛠', '🧪', '🎨', '🎵', '🎬', '🛒', '💼', '🏠', '✈️', '💬', '📰', '🔒', '💰', '🎮', '🌍', '📌', '❤️']
  // label: lesbarer Name für Screenreader und Tooltip; ohne label bleibt das Symbol stumm (aria-hidden), der Knopf trägt den Namen.
  function icon(name, label) {
    if (!P[name]) return null
    const s = document.createElementNS(NS, 'svg')
    for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'pi' })) s.setAttribute(k, v)
    if (label) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', label) } else s.setAttribute('aria-hidden', 'true')
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', P[name]); s.append(p)
    return s
  }
  globalThis.PikaIcons = { icon, names: Object.keys(P), EMOJI }
})()
