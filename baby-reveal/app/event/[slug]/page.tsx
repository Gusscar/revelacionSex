import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventLobbyClient } from './EventLobbyClient'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, baby_name')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Evento no encontrado' }

  return {
    title: `${event.title} - Baby Reveal`,
    description: event.baby_name
      ? `Revela el genero de baby ${event.baby_name}! Vota y reacciona en vivo.`
      : 'Revela el genero del bebe! Vota y reacciona en vivo.',
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: participants }, { data: comments }] = await Promise.all([
    supabase.from('participants').select('*').eq('event_id', event.id).order('joined_at'),
    supabase.from('comments').select('*').eq('event_id', event.id).order('created_at', { ascending: false }).limit(30),
  ])

  const isOwner = user?.id === event.owner_id

  return (
    <EventLobbyClient
      initialEvent={event}
      initialParticipants={participants ?? []}
      initialComments={comments ?? []}
      userId={user?.id ?? null}
      isOwner={isOwner}
    />
  )
}
