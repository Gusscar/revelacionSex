import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecapClient } from './RecapClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RecapPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const [{ data: participants }, { data: reactions }] = await Promise.all([
    supabase.from('participants').select('*').eq('event_id', event.id),
    supabase.from('reactions').select('*').eq('event_id', event.id),
  ])

  return (
    <RecapClient
      event={event}
      participants={participants ?? []}
      reactions={reactions ?? []}
    />
  )
}
