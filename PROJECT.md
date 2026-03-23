# Ana Hagen DJ — Guía completa del proyecto

> Documento para onboarding de Claude en nuevas sesiones. Leer antes de tocar cualquier código.

---

## El proyecto

Landing page + panel de administración para **Ana Hagen**, DJ argentina de Minimal Techno, House y Techno. El sitio es su presencia digital completa: muestra sus fechas, sus videos, su selección musical y permite a fans verla en vivo por streaming directamente desde la página.

| Campo | Valor |
|-------|-------|
| Cliente | Ana Hagen |
| Instagram | https://www.instagram.com/anahagen__/ |
| Email booking | bookinganahagen@gmail.com |
| Desarrollado por | Petra Labs · petralabs.xyz |
| Repositorio | https://github.com/ignaciobavala-png/ana-hagen.git |

---

## Stack

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Next.js | 16.1.6 | App Router, Server Components, Server Actions |
| React | ^18 | |
| TypeScript | ^5 | |
| Tailwind CSS | ^3.4.1 | Tokens custom: accent, cream, card, ink |
| Supabase | @supabase/ssr | Postgres + Auth + Storage + Realtime |
| LiveKit | livekit-server-sdk + @livekit/components-react + livekit-client | Streaming WebRTC |
| Package manager | pnpm | |
| Deploy | `vercel --prod` desde local | NO auto-deploy desde GitHub |

---

## Diseño

### Paleta
| Token | Hex | Uso |
|-------|-----|-----|
| `accent` | `#9B4EB8` | Violeta — acento principal |
| `accent-dark` | `#7A3A95` | Hover del acento |
| `cream` | `#FAF7F2` | Fondo claro (secciones Dates, Booking) |
| `card` | `#F2EDE6` | Fondo alternativo claro |
| `ink` | `#1A1A1A` | Texto principal y fondos oscuros (LiveSection, MusicPlayer, Videos) |

**Estética:** Techno minimalista, femenina. Tipografía display grande (Bebas Neue), body legible (Space Grotesk). Grain overlay sutil en toda la página. Secciones claras y oscuras alternadas.

### Tipografías
- **Display / Títulos:** Bebas Neue 400 → clase `font-display`
- **Body / UI:** Space Grotesk → clase `font-body`

---

## Arquitectura de la landing (app/page.tsx)

```
Hero         → Server Component — video/imagen fullscreen desde Supabase Storage
LiveSection  → Server Component → LiveViewer (client, Realtime)
Dates        → Server Component — tabla `events`
Videos       → Server Component → VideosCarousel (client, thumbnails YouTube)
PlaylistSection → Server Component → PlaylistClient → MusicPlayer (client, SoundCloud Widget API)
Booking      → Server Component + BookingForm (client)
Footer       → Server Component — redes sociales desde Supabase
```

**Regla importante:** `ssr: false` en `dynamic()` solo puede usarse en Client Components. Por eso existen wrappers como `PlaylistClient.tsx` y `LiveViewer.tsx` que son `'use client'` y delegan el dynamic import.

---

## Secciones del sitio — detalle

### Hero
- Fondo: video o imagen fullscreen (configurable desde `/dashboard/hero`)
- Fuente: tabla `hero_config` (id=1) en Supabase. Fallback: `/video/herov.mp4` local
- El video local **NO está en git** — se sube en cada `vercel --prod` desde local

### Live Streaming (`/` → sección "SINTONIZÁ EN VIVO")
- **Estado offline (siempre visible):** banner oscuro con waveform animado, link a Instagram
- **Estado en vivo:** banner violeta pulsante "EN VIVO", área 16:9 negra, botón "VER TRANSMISIÓN"
- `LiveViewer.tsx` suscribe a Supabase Realtime (`postgres_changes` en `live_config`) — el cambio llega automáticamente a todos los visitantes sin refresh
- El viewer hace fetch a `/api/livekit/viewer-token` → conecta al room LiveKit
- Tecnología WebRTC: **LiveKit Cloud**

### Dates
- Tabla `events` — campos: date, venue, city, ticket_link, flyer_url, published
- Estado vacío: "PRÓXIMAMENTE NUEVAS FECHAS"
- Formateo de fecha con `d.getUTCDate()` para evitar off-by-one de timezone

### Videos (SETS)
- `Videos.tsx` (server) → `VideosCarousel.tsx` (client)
- Carrusel horizontal con thumbnails reales de YouTube (`maxresdefault.jpg`)
- **Façade pattern:** muestra thumbnail + play button, carga iframe solo al hacer click (autoplay)
- Tabla `videos` en Supabase: youtube_id, title, sort_order, published

### Música (ESCUCHÁ)
- `PlaylistSection.tsx` (server) → `PlaylistClient.tsx` (client wrapper) → `MusicPlayer.tsx` (client, dynamic ssr:false)
- **Carrusel horizontal** de cards con cover art o gradiente violeta + número
- Botón play circular visible en hover; waveform animado en el track activo
- Player bar debajo: barra de progreso seekable, prev/play-pause/next, tiempo
- Motor: **SoundCloud Widget API** — iframe oculto en `id="sc-widget"`, hook `useSoundCloudWidget`
- El iframe siempre apunta al primer track; al cambiar track se llama `widget.load(url, {auto_play: true})`
- Tabla `playlist_tracks`: title, artist, soundcloud_url, cover_url, sort_order, published

### Booking
- Email y teléfono desde `contact_config` (id=1). Fallback hardcodeado: `bookinganahagen@gmail.com`
- Formulario: nombre, email, tipo de evento, fecha tentativa, mensaje → tabla `booking_requests`

### Footer
- Links sociales desde `contact_config`: instagram, soundcloud, resident_advisor
- Solo muestra los que no son null

---

## Dashboard de admin

Acceso: `/admin` → login → `/dashboard`

| Ruta | Función |
|------|---------|
| `/dashboard` | Stats: conteos de eventos, bookings, suscriptores |
| `/dashboard/events` | CRUD de fechas de shows |
| `/dashboard/bookings` | Ver consultas de booking recibidas |
| `/dashboard/videos` | CRUD de videos (acepta YouTube ID o URL completa) |
| `/dashboard/playlist` | CRUD de tracks de la playlist |
| `/dashboard/live` | Control de streaming en vivo |
| `/dashboard/hero` | Subir video/imagen del hero a Supabase Storage |
| `/dashboard/contact` | Editar email, teléfono, redes sociales |

### Flujo de live streaming desde el dashboard
1. Ir a `/dashboard/live`
2. Click "Iniciar transmisión" (título opcional)
3. El dashboard pide token a `/api/livekit/host-token` (requiere sesión Supabase)
4. Server action `goLive(title)` → escribe `is_live: true` en `live_config`
5. Se carga `LiveKitBroadcast.tsx` — Ana elige: compartir pantalla o cámara
6. Los visitantes reciben el cambio via Realtime, aparece el banner "EN VIVO"
7. Click "Terminar" → `endLive()` → `is_live: false` → landing vuelve a offline

---

## Base de datos — Supabase

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `events` | Shows (date, venue, city, ticket_link, flyer_url, published) |
| `booking_requests` | Consultas del formulario público |
| `subscribers` | Emails suscritos |
| `hero_config` | Singleton id=1: tipo y URL del media del hero |
| `contact_config` | Singleton id=1: email, teléfono, redes |
| `videos` | YouTube IDs con título y sort_order |
| `live_config` | Singleton id=1: is_live, stream_title, started_at |
| `playlist_tracks` | Tracks de SoundCloud con cover_url y sort_order |

### SQL pendiente de aplicar
Ejecutar en Supabase SQL Editor en este orden:
1. `supabase/setup.sql`
2. `supabase/contact_config.sql`
3. `supabase/videos_and_live.sql`
4. `supabase/playlist.sql`

Después: en **Database → Replication**, activar la tabla `live_config` para Realtime.

### Storage buckets
- `hero` — video/imagen del hero (público)
- `flyers` — flyers de eventos (público)

### Auth
- Usuario admin: crearlo en Supabase Dashboard → Authentication → Users → Add user
- El login está en `/admin` (no `/login` — esa ruta redirige a `/admin`)

---

## Variables de entorno (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LiveKit — necesario para el streaming en vivo
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=wss://tu-proyecto.livekit.cloud
```

**LiveKit:** crear cuenta en livekit.io → nuevo proyecto → copiar las 3 credenciales. Plan gratuito: 100h/mes de streaming, suficiente para empezar.

Las mismas variables deben estar en **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## Autenticación y protección de rutas

`proxy.ts` (equivalente a `middleware.ts` en Next.js 16):
- `/dashboard/*` sin sesión → redirige a `/admin`
- `/login` con sesión → redirige a `/dashboard`

`/api/livekit/host-token` verifica sesión Supabase antes de emitir el JWT de LiveKit.
`/api/livekit/viewer-token` es público (no requiere auth).

---

## Componentes clave — ubicación

```
components/
├── Hero.tsx                    Server — hero fullscreen
├── HeroCTA.tsx                 Client — botón CTA
├── LiveSection.tsx             Server — fetch live_config inicial
├── LiveViewer.tsx              Client — Realtime + estado offline/live
├── LiveKitViewer.tsx           Client — WebRTC viewer (dynamic, ssr:false)
├── LiveKitBroadcast.tsx        Client — WebRTC broadcaster (dynamic, ssr:false)
├── Dates.tsx                   Server — lista de shows
├── Videos.tsx                  Server — fetch videos
├── VideosCarousel.tsx          Client — carrusel con thumbnails + click-to-load
├── PlaylistSection.tsx         Server — fetch playlist_tracks
├── PlaylistClient.tsx          Client wrapper — dynamic import ssr:false
├── MusicPlayer.tsx             Client — carrusel + SoundCloud Widget API
├── Booking.tsx                 Server — email/tel desde Supabase
├── BookingForm.tsx             Client — formulario de consulta
├── Footer.tsx                  Server — redes sociales
└── dashboard/
    ├── EventForm.tsx
    ├── VideoList.tsx
    ├── PlaylistManager.tsx
    ├── LiveControls.tsx        Client — botón go live, carga LiveKitBroadcast
    ├── HeroUploader.tsx
    ├── ContactForm.tsx
    └── LogoutButton.tsx

lib/
├── supabase/
│   ├── client.ts               createClient() client-side
│   └── server.ts               createClient() + createServiceClient() server
├── hooks/
│   └── useSoundCloudWidget.ts  Hook: carga SDK SC, expone state/load/toggle/seekTo
└── actions/
    ├── booking.ts
    ├── events.ts
    ├── hero.ts
    ├── contact.ts
    ├── videos.ts               createVideo, updateVideo, deleteVideo, reorderVideos
    ├── playlist.ts             CRUD playlist_tracks
    └── live.ts                 goLive(title), endLive()
```

---

## Deploy

```bash
# Desarrollo local
pnpm dev

# Deploy a producción (sube todo public/ incluyendo el video del hero)
vercel --prod

# Push de código a GitHub (backup — no dispara deploy)
git add [archivos]
git commit -m "descripción"
git push
```

**GitHub** (`https://github.com/ignaciobavala-png/ana-hagen.git`) es solo backup de código. Los deploys siempre son manuales desde local con `vercel --prod` para asegurar que el video del hero se incluya.

---

## Keep-alive Cron

`vercel.json` define un cron `0 12 * * *` (12:00 UTC diario) que llama a `/api/keep-alive`. Previene que Supabase pause el proyecto por inactividad (plan gratuito pausa tras 1 semana sin requests).

---

## Pendientes

- [ ] Aplicar los 4 SQLs en Supabase
- [ ] Activar `live_config` en Supabase Realtime (Database → Replication)
- [ ] Crear usuario admin en Supabase Auth
- [ ] Configurar variables de entorno en Vercel Dashboard
- [ ] Crear proyecto en LiveKit Cloud y agregar las 3 vars al `.env.local` y Vercel
- [ ] Agregar OG image (`app/opengraph-image`) para preview en redes
- [ ] Configurar dominio custom en Vercel dashboard
- [ ] Agregar SoundCloud y Resident Advisor links cuando Ana los tenga
