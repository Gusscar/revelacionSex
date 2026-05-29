import { createClient } from '@/lib/supabase/client'
import { Event, Participant, Comment, Reaction } from '@/types'
import { generateSlug } from '@/utils/slug'

export async function createEvent(data: {
  title: string
  baby_name?: string
  reveal_date: string
  theme: string
  reveal_mode: string
  cover_image?: string
  owner_id: string | null
  guest_owner_id?: string | null
}): Promise<Event> {
  const supabase = createClient()
  const slug = generateSlug(data.title)
  const keeper_token = crypto.randomUUID()

  const { data: event, error } = await supabase
    .from('events')
    .insert({ ...data, slug, keeper_token })
    .select()
    .single()

  if (error) throw error
  return event
}

export async function getEventByKeeperToken(slug: string, token: string): Promise<Event | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('keeper_token', token)
    .single()
  return data ?? null
}

export async function setRevealResult(eventId: string, keeperToken: string, result: 'boy' | 'girl'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .update({ result })
    .eq('id', eventId)
    .eq('keeper_token', keeperToken)
  if (error) throw error
}

export async function triggerKeeperReveal(eventId: string, keeperToken: string, result: 'boy' | 'girl'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .update({ result, is_revealed: true })
    .eq('id', eventId)
    .eq('keeper_token', keeperToken)
  if (error) throw error
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getParticipants(eventId: string): Promise<Participant[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true })

  return data ?? []
}

export async function joinEvent(data: {
  event_id: string
  nickname: string
  user_id?: string | null
  avatar?: string | null
}): Promise<Participant> {
  const supabase = createClient()
  const { data: participant, error } = await supabase
    .from('participants')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return participant
}

export async function castVote(participantId: string, team: 'boy' | 'girl'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('participants')
    .update({ team_vote: team })
    .eq('id', participantId)

  if (error) throw error
}

export async function sendReaction(data: {
  event_id: string
  user_id?: string | null
  type: string
}): Promise<Reaction> {
  const supabase = createClient()
  const { data: reaction, error } = await supabase
    .from('reactions')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return reaction
}

export async function sendComment(data: {
  event_id: string
  user_id?: string | null
  nickname?: string
  message: string
}): Promise<Comment> {
  const supabase = createClient()
  const { data: comment, error } = await supabase
    .from('comments')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return comment
}

export async function getComments(eventId: string): Promise<Comment[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function triggerReveal(eventId: string, result: 'boy' | 'girl'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .update({ result, is_revealed: true })
    .eq('id', eventId)

  if (error) throw error
}

export async function triggerFakeReveal(eventId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('increment_fake_reveal', { event_id: eventId })
  if (error) {
    // fallback: direct update
    await supabase
      .from('events')
      .update({ fake_reveal_count: 999 })
      .eq('id', eventId)
  }
}
