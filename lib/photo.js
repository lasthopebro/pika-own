// Fotorahmen (v0.8): Adressprüfung ohne Browser testbar. Gespeichert werden nur Adressen, nie Bilddaten.
export const MAX_PHOTOS = 6

// Normalisierte Adresse, wenn es eine https:-Adresse mit Host ist, sonst null (javascript:, http:, data: … werden abgelehnt).
export function httpsUrl(s) {
  try { const u = new URL(String(s).trim()); return u.protocol === 'https:' && u.host ? u.href : null } catch { return null }
}

// Eine Adresse pro Zeile -> { urls } oder { error } (Text für die Anzeige).
export function parsePhotoUrls(text) {
  const lines = String(text || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
  const bad = lines.find((l) => !httpsUrl(l))
  if (bad) return { error: 'Nur https-Adressen erlaubt: ' + bad.slice(0, 40) }
  const urls = [...new Set(lines.map(httpsUrl))]
  return urls.length > MAX_PHOTOS ? { error: `Höchstens ${MAX_PHOTOS} Adressen` } : { urls }
}
