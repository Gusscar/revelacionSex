/** Normaliza el nombre para usarlo como clave de login */
export function nameToKey(name: string): string {
  return name.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Hashea la contraseña con SHA-256 via Web Crypto API */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const STORAGE_KEY = 'guest_account_id'

export function saveGuestId(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
}

export function loadGuestId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}
