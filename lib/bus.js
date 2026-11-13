import { B } from './api.js'

// Nachricht an den Hintergrund (Neuer Tab, Seitenleiste, Content-Script). Antwort ist ein Promise.
export const call = (type, data = {}) => B.runtime.sendMessage({ type, ...data })