// Einzige Liste der Widget-Typen (Reihenfolge = Reihenfolge im Dialog). Neues Widget: Datei widgets/<typ>.js (Vertrag siehe README) und hier eintragen.
import clock from './clock.js'
import countdown from './countdown.js'
import timer from './timer.js'
import counter from './counter.js'
import snippets from './snippets.js'

export const WIDGETS = { clock, countdown, timer, counter, snippets }
