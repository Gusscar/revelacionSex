const PALABRAS_OBSCENAS = [
  'mierda', 'puta', 'puto', 'putas', 'putos', 'coño', 'cojones', 'cojón',
  'joder', 'jodido', 'jodida', 'marica', 'maricón', 'pendejo', 'pendeja',
  'pendejos', 'culo', 'culos', 'verga', 'vergas', 'chingar', 'chingada',
  'chingado', 'chinga', 'chingadera', 'follar', 'follando', 'cabrón',
  'cabrona', 'cabrones', 'hdp', 'hp', 'hijodeputa', 'malparido', 'malparida',
  'gonorrea', 'perra', 'perro', 'bastardo', 'bastarda', 'idiota', 'imbécil',
  'imbecil', 'estúpido', 'estupido', 'estúpida', 'estupida', 'gilipollas',
  'mamón', 'mamona', 'mamar', 'chupa', 'mamada', 'putón', 'zorras', 'zorra',
  'polla', 'pollas', 'coger', 'cogiendo', 'naco', 'naca', 'wey', 'güey',
]

const REGEX_CACHE = PALABRAS_OBSCENAS.map(
  (p) => new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
)

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return REGEX_CACHE.some((re) => { re.lastIndex = 0; return re.test(lower) })
}

export function filterProfanity(text: string): string {
  let result = text
  for (const re of REGEX_CACHE) {
    re.lastIndex = 0
    result = result.replace(re, (match) => '*'.repeat(match.length))
  }
  return result
}
