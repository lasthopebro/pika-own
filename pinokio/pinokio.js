module.exports = {
  version: "7.0",
  menu: async (kernel, info) => {
    // Alle Skripte laufen im Projektordner (eine Ebene höher). Es gibt nichts zu installieren: alles läuft über npx.
    const item = (icon, text, href) => ({ icon, text, href, running: info.running(href) })
    return [
      { ...item("fa-brands fa-firefox-browser", "In Firefox starten (Testprofil)", "ff.js"), default: true },
      item("fa-solid fa-flask", "Tests", "test.js"),
      item("fa-solid fa-broom", "Lint (web-ext)", "lint.js"),
      item("fa-solid fa-database", "Seed aus Browsern bauen", "seed.js"),
      item("fa-solid fa-lightbulb", "Inspirations-Repos analysieren", "inspiration.js"),
      item("fa-solid fa-robot", "Ollama-Modelle anzeigen", "ollama.js"),
      item("fa-solid fa-rotate", "Aktualisieren", "update.js")
    ]
  }
}
