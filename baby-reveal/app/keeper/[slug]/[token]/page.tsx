import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KeeperClient } from './KeeperClient'

interface Props {
  params: Promise<{ slug: string; token: string }>
}

export default async function KeeperPage({ params }: Props) {
  const { slug, token } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('keeper_token', token)
    .single()

  if (!event) notFound()

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', event.id)

  return <KeeperClient event={event} initialParticipants={participants ?? []} token={token} />
}
