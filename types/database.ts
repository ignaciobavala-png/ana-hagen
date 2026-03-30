export interface Event {
  id: string
  date: string
  venue: string
  city: string
  ticket_link: string | null
  flyer_url: string | null
  published: boolean
  created_at: string
}

export interface BookingRequest {
  id: string
  name: string
  email: string
  event_type: string
  event_date: string | null
  message: string
  read: boolean
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  confirmed: boolean
  created_at: string
}

export interface HeroConfig {
  id: number
  media_type: 'video' | 'image'
  media_url: string
  updated_at: string
}

export interface Video {
  id: string
  title: string | null
  youtube_id: string
  published: boolean
  sort_order: number
  created_at: string
}

export interface PlaylistTrack {
  id: string
  title: string
  artist: string
  soundcloud_url: string
  cover_url: string | null
  sort_order: number
  published: boolean
  created_at: string
}

export interface LiveConfig {
  id: number
  is_live: boolean
  stream_title: string | null
  youtube_id: string | null
  started_at: string | null
  updated_at: string
}
