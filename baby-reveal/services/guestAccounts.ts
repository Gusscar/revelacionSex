import { createClient } from '@/lib/supabase/client'
import { nameToKey, hashPassword } from '@/utils/guestAuth'

export interface GuestAccount {
  id: string
  name: string
}

export async function registerGuest(name: string, password: string): Promise<GuestAccount> {
  const supabase = createClient()
  const hash = await hashPassword(password)
  const { data, error } = await supabase
    .from('guest_accounts')
    .insert({ name: name.trim(), name_key: nameToKey(name), password_hash: hash })
    .select('id, name')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Ese nombre ya está en uso. Usa "Iniciar sesión".')
    throw new Error(error.message)
  }
  return data
}

export async function loginGuest(name: string, password: string): Promise<GuestAccount> {
  const supabase = createClient()
  const hash = await hashPassword(password)
  const { data, error } = await supabase
    .from('guest_accounts')
    .select('id, name')
    .eq('name_key', nameToKey(name))
    .eq('password_hash', hash)
    .single()
  if (error || !data) throw new Error('Nombre o contraseña incorrectos')
  return data
}
