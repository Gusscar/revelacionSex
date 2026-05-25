export type Team = 'boy' | 'girl' | null

export type RevealTheme =
  | 'fireworks'
  | 'paint_explosion'
  | 'confetti'
  | 'casino'
  | 'football'
  | 'mystery_box'
  | 'roulette'
  | 'space_rocket'
  | 'glitch'
  | 'cinematic'

export type RevealMode = 'countdown' | 'instant' | 'dramatic'

export interface Profile {
  id: string
  username: string | null
  avatar: string | null
  created_at: string
}

export interface Event {
  id: string
  owner_id: string
  title: string
  baby_name: string | null
  reveal_date: string
  theme: RevealTheme
  reveal_mode: RevealMode
  slug: string
  cover_image: string | null
  result: Team
  is_revealed: boolean
  fake_reveal_count: number
  keeper_token: string
  created_at: string
}

export interface Participant {
  id: string
  event_id: string
  user_id: string | null
  nickname: string
  avatar: string | null
  team_vote: Team
  joined_at: string
}

export interface Reaction {
  id: string
  event_id: string
  user_id: string | null
  type: string
  created_at: string
}

export interface Comment {
  id: string
  event_id: string
  user_id: string | null
  message: string
  nickname: string | null
  created_at: string
}

export interface MediaUpload {
  id: string
  event_id: string
  user_id: string | null
  media_url: string
  media_type: 'image' | 'video'
  created_at: string
}

export interface VoteStats {
  boy: number
  girl: number
  total: number
  boyPercent: number
  girlPercent: number
}

export interface FloatingEmoji {
  id: string
  emoji: string
  x: number
  createdAt: number
}

export const REVEAL_THEMES: { value: RevealTheme; label: string; emoji: string }[] = [
  { value: 'fireworks', label: 'Fuegos Artificiales', emoji: '🎆' },
  { value: 'confetti', label: 'Confetti', emoji: '🎊' },
  { value: 'paint_explosion', label: 'Explosion de Pintura', emoji: '💥' },
  { value: 'casino', label: 'Casino', emoji: '🎰' },
  { value: 'football', label: 'Futbol', emoji: '⚽' },
  { value: 'mystery_box', label: 'Caja Misteriosa', emoji: '📦' },
  { value: 'roulette', label: 'Ruleta', emoji: '🎡' },
  { value: 'space_rocket', label: 'Cohete Espacial', emoji: '🚀' },
  { value: 'glitch', label: 'Glitch Reveal', emoji: '⚡' },
  { value: 'cinematic', label: 'Cinematico', emoji: '🎬' },
]

export const TEAM_EMOJIS: Record<string, string> = {
  boy: '💙',
  girl: '💖',
}

export const QUICK_EMOJIS = ['😱', '🎉', '💙', '💖', '🔥', '😭', '🥹', '❤️', '🎊', '👶']
