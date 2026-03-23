# Ana Hagen DJ — Contexto completo del proyecto

## Cliente

| Campo | Valor |
|-------|-------|
| Nombre | Ana Hagen |
| Perfil | DJ argentina — Minimal Techno, House, Techno |
| Instagram | https://www.instagram.com/anahagen__/ |
| Email booking | bookinganahagen@gmail.com |

---

## Stack tecnológico

| Herramienta | Versión |
|-------------|---------|
| Next.js | 16.1.6 (App Router) |
| React | ^18 |
| TypeScript | ^5 |
| Tailwind CSS | ^3.4.1 |
| Base de datos | Supabase (Postgres + Auth + Storage) |
| Package manager | pnpm |
| Deploy | Vercel CLI local (NO auto-deploy desde GitHub) |

---

## Estructura de archivos

```
ana-hagen/
├── app/
│   ├── api/
│   │   └── keep-alive/
│   │       └── route.ts               # Cron de keep-alive → { ok: true }
│   ├── login/
│   │   └── page.tsx                   # Login con Supabase Auth
│   ├── dashboard/
│   │   ├── layout.tsx                 # Nav del admin
│   │   ├── page.tsx                   # Stats: eventos, bookings, suscriptores
│   │   ├── events/
│   │   │   ├── page.tsx               # Lista de eventos
│   │   │   ├── new/page.tsx           # Crear evento
│   │   │   └── [id]/page.tsx          # Editar evento
│   │   ├── bookings/
│   │   │   └── page.tsx               # Consultas de booking recibidas
│   │   ├── hero/
│   │   │   └── page.tsx               # Subir video/imagen del hero
│   │   └── contact/
│   │       └── page.tsx               # Editar email, teléfono, redes sociales
│   ├── globals.css                    # Estilos base + grain overlay
│   ├── layout.tsx                     # Fuentes, metadata, body.grain
│   └── page.tsx                       # Hero → Dates → Videos → Booking → Footer
├── components/
│   ├── Hero.tsx                       # Video/imagen fullscreen desde Supabase Storage
│   ├── HeroCTA.tsx                    # Botón CTA (client component)
│   ├── Dates.tsx                      # Fechas desde tabla `events` de Supabase
│   ├── Videos.tsx                     # Grid 2×2 de iframes YouTube (hardcodeados)
│   ├── Booking.tsx                    # Sección booking con email y teléfono desde Supabase
│   ├── BookingForm.tsx                # Formulario de consulta → tabla `booking_requests`
│   ├── Footer.tsx                     # Redes sociales desde Supabase + copyright
│   └── dashboard/
│       ├── EventForm.tsx              # Formulario para crear/editar eventos
│       ├── HeroUploader.tsx           # Upload a Supabase Storage bucket `hero`
│       ├── ContactForm.tsx            # Editar contact_config
│       └── LogoutButton.tsx           # Logout de Supabase Auth
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # createClient() para uso client-side
│   │   └── server.ts                  # createClient() + createServiceClient() para server
│   └── actions/
│       ├── booking.ts                 # submitBookingRequest, markBookingRead
│       ├── events.ts                  # CRUD de eventos
│       ├── hero.ts                    # Actualizar hero_config
│       └── contact.ts                 # Actualizar contact_config
├── types/
│   └── database.ts                    # Tipos: Event, BookingRequest, Subscriber, HeroConfig
├── supabase/
│   ├── setup.sql                      # Schema completo: tablas, RLS, storage buckets
│   └── contact_config.sql             # Tabla contact_config (separada para historial)
├── public/
│   └── video/
│       └── herov.mp4                  # Video hero (~3 MB) — NO está en git
├── proxy.ts                           # Auth guard: redirige /dashboard → /login si no hay sesión
├── next.config.js
├── tailwind.config.ts
├── vercel.json                        # Cron diario keep-alive (0 12 * * *)
└── .env.local                         # Variables de entorno locales (no en git)
```

---

## Diseño y estilos

### Paleta de colores

| Token Tailwind | Valor HEX | Uso |
|----------------|-----------|-----|
| `accent` | `#9B4EB8` | Violeta — acento principal, sección Booking, hover |
| `accent-dark` | `#7A3A95` | Hover del acento |
| `cream` | `#FAF7F2` | Fondo principal del sitio |
| `card` | `#F2EDE6` | Fondo de la sección Dates |
| `ink` | `#1A1A1A` | Texto principal |

### Tipografías (Google Fonts)

| Rol | Fuente | Variable CSS |
|-----|--------|-------------|
| Display / Títulos | Bebas Neue 400 | `--font-bebas` / `font-display` |
| Body / UI | Space Grotesk | `--font-space-grotesk` / `font-body` |

### Efectos globales

- **Grain overlay**: pseudoelemento `::before` en `body.grain` — SVG de ruido fractal con opacidad 0.035, animado con `@keyframes grain` (0.5s steps).
- **Scroll suave**: `html { scroll-behavior: smooth }`.

---

## Base de datos — Supabase

### Proyecto

| Campo | Valor |
|-------|-------|
| URL | `NEXT_PUBLIC_SUPABASE_URL` en `.env.local` |
| Proyecto | https://supabase.com/dashboard |

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `events` | Fechas de shows (date, venue, city, ticket_link, flyer_url, published) |
| `booking_requests` | Consultas recibidas del formulario público |
| `subscribers` | Emails suscritos para notificaciones |
| `hero_config` | Fila única (id=1): tipo y URL del media del hero |
| `contact_config` | Fila única (id=1): email, teléfono, redes sociales |

### Storage buckets

| Bucket | Uso |
|--------|-----|
| `hero` | Video o imagen del hero (acceso público) |
| `flyers` | Flyers de eventos (acceso público) |

### RLS

- `events`: lectura pública solo de publicados, escritura solo autenticados
- `booking_requests`: insert público, lectura/update solo autenticados
- `subscribers`: insert público, lectura solo autenticados
- `hero_config`: lectura pública, update solo autenticados
- `contact_config`: lectura pública, update solo autenticados

### Aplicar schema

1. Ir a https://supabase.com/dashboard → proyecto → SQL Editor
2. Ejecutar `supabase/setup.sql` completo
3. Ejecutar `supabase/contact_config.sql` completo

### Crear usuario admin

1. Supabase dashboard → Authentication → Users → Add user
2. Email: el de Ana (o el tuyo para gestionar)
3. Password: elegir uno seguro
4. Con esas credenciales se accede a `/login` → `/dashboard`

---

## Componentes — resumen

### `Hero.tsx`
- Server component. Lee `hero_config` de Supabase (media_url + media_type).
- Fallback: `/video/herov.mp4` local si Supabase no responde.
- Renderiza `<video>` o `<img>` según `media_type`.

### `Dates.tsx`
- Server component. Lee tabla `events` donde `published = true`, ordenado por fecha.
- Estado vacío: "PRÓXIMAMENTE NUEVAS FECHAS".
- Muestra: día (rojo carmín), mes/año, venue, ciudad, flyer thumbnail, botón entradas o badge FREE.

### `Videos.tsx`
- Server component. 4 iframes YouTube hardcodeados en `VIDEO_IDS[]`.
- Para cambiar videos: editar el array directamente en el archivo.

### `Booking.tsx`
- Server component. Lee `contact_config` de Supabase (booking_email, phone).
- Fallback: `bookinganahagen@gmail.com` hardcodeado.
- Incluye `<BookingForm />` (client component).

### `BookingForm.tsx`
- Client component. Formulario desplegable con campos: nombre, email, tipo de evento, fecha tentativa, mensaje.
- Llama a Server Action `submitBookingRequest` → inserta en `booking_requests`.

### `Footer.tsx`
- Server component. Lee `contact_config` (instagram, soundcloud, resident_advisor).
- Muestra solo los links que están configurados (no null).

---

## Video del Hero

- Archivo: `public/video/herov.mp4` (~3 MB)
- **NO está en git** (en `.gitignore`)
- Se incluye automáticamente en cada `vercel --prod` porque el CLI sube todo `public/`
- Alternativa: subir el video desde el dashboard → `/dashboard/hero` → queda en Supabase Storage

---

## Deploy

### Flujo de trabajo
```bash
# Desarrollo local
pnpm dev

# Deploy a producción (incluye el video porque se sube desde local)
vercel --prod

# Push de cambios de código a GitHub (sin el video)
git add .
git commit -m "descripción"
git push
```

### Variables de entorno en Vercel

Deben estar configuradas en Vercel Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Repositorio
- GitHub: https://github.com/ignaciobavala-png/ana-hagen.git
- GitHub es solo backup — NO dispara deploys automáticos en Vercel.

---

## Keep-alive Cron

- `vercel.json` define un cron `0 12 * * *` (12:00 UTC diario).
- Llama a `/api/keep-alive` → responde `{ ok: true }`.
- Previene que Supabase pause el proyecto por inactividad (plan gratuito pausa tras 1 semana sin requests).

---

## SEO / Metadata

Definida en `app/layout.tsx`:
- title: `"Ana Hagen · DJ"`
- description: `"Ana Hagen — DJ from Buenos Aires. Minimal Techno, House, Techno. Booking & upcoming dates."`
- openGraph: title + description + type: "website"

**Pendiente**: Agregar `app/opengraph-image` para preview al compartir en redes.

---

## Pendientes

- [ ] Aplicar schema en Supabase (setup.sql + contact_config.sql)
- [ ] Crear usuario admin en Supabase Auth
- [ ] Configurar env vars en Vercel Dashboard
- [ ] Agregar OG image (`app/opengraph-image`)
- [ ] Configurar dominio custom en Vercel dashboard
- [ ] Agregar SoundCloud link cuando Ana lo tenga
- [ ] Agregar Resident Advisor link cuando Ana lo tenga

---

## Desarrollado por

Petra Labs · petralabs.xyz
