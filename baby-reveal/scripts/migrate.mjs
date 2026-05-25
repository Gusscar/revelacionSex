import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg

const __dir = dirname(fileURLToPath(import.meta.url))

// La contraseña la pasas como argumento: node scripts/migrate.mjs TU_PASSWORD
const dbPassword = process.argv[2]

if (!dbPassword) {
  console.error('Uso: node scripts/migrate.mjs TU_DB_PASSWORD')
  console.error('Encuentra tu password en: Supabase Dashboard > Settings > Database > Database password')
  process.exit(1)
}

const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: `postgres.vrdwcyumasptxrynvkwv`,
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  console.log('Conectando a Supabase...')
  await client.connect()
  console.log('Conectado!')

  const sql = readFileSync(join(__dir, '../lib/supabase/schema.sql'), 'utf-8')

  // Split by semicolon but be careful with functions that contain semicolons
  // Split on double newlines + semicolons for safety
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let success = 0
  let skipped = 0

  for (const stmt of statements) {
    const preview = stmt.slice(0, 60).replace(/\n/g, ' ')
    try {
      await client.query(stmt + ';')
      console.log(`✓ ${preview}...`)
      success++
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log(`~ ya existe: ${preview}...`)
        skipped++
      } else {
        console.warn(`! Error en: ${preview}...`)
        console.warn(`  ${err.message}`)
      }
    }
  }

  await client.end()
  console.log(`\nMigracion completa: ${success} ejecutadas, ${skipped} omitidas`)
}

run().catch(err => {
  console.error('Error fatal:', err.message)
  process.exit(1)
})
