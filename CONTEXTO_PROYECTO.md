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
| Package manager | pnpm |
| Deploy | Vercel CLI local (NO auto-deploy desde GitHub) |

No hay base de datos. Los datos dinámicos (fechas) vienen de Google Sheets vía fetch client-side.

---

## Estructura de archivos

```
ana-hagen/
├── app/
│   ├── api/
│   │   └── keep-alive/
│   │       └── route.ts          # Responde { ok: true } — cron de keep-alive
│   ├── globals.css               # Estilos base + grain overlay + animaciones CSS
│   ├── layout.tsx                # Fuentes, metadata, body.grain
│   └── page.tsx                  # Orden de secciones: Hero → Dates → Videos → Booking → Footer
├── components/
│   ├── Hero.tsx                  # Video fullscreen + overlay + título + CTA booking
│   ├── Dates.tsx                 # Fechas desde Google Sheets (client-side fetch)
│   ├── Videos.tsx                # Grid 2×2 de iframes YouTube
│   ├── Booking.tsx               # Sección rojo carmín con mailto: link
│   └── Footer.tsx                # Instagram + copyright
├── public/
│   └── video/
│       └── herov.mp4             # Video hero (~3 MB) — NO está en git
├── next.config.js                # Permite imágenes remotas de img.youtube.com
├── tailwind.config.ts            # Tokens de color y fuentes personalizados
├── vercel.json                   # Cron diario keep-alive (0 12 * * *)
├── NOTAS_PROYECTO.md             # Notas operativas del proyecto
└── CONTEXTO_PROYECTO.md          # Este archivo
```

---

## Diseño y estilos

### Paleta de colores

| Token Tailwind | Valor HEX | Uso |
|----------------|-----------|-----|
| `accent` | `#C8102E` | Rojo carmín — acento principal, sección Booking, hover de fechas |
| `accent-dark` | `#A00D24` | Hover del acento |
| `cream` | `#FAF7F2` | Fondo principal del sitio |
| `card` | `#F2EDE6` | Fondo de la sección Dates |
| `ink` | `#1A1A1A` | Texto principal |

### Tipografías (Google Fonts)

| Rol | Fuente | Variable CSS |
|-----|--------|-------------|
| Display / Títulos | Bebas Neue 400 | `--font-bebas` / `font-display` |
| Body / UI | Space Grotesk | `--font-space-grotesk` / `font-body` |

### Efectos globales

- **Grain overlay**: pseudoelemento `::before` en `body.grain` — SVG de ruido fractal con opacidad 0.035, animado con `@keyframes grain` (0.5s steps). Crea textura analógica en toda la página.
- **Scroll suave**: `html { scroll-behavior: smooth }` — los CTA de la Hero hacen scroll a `#booking`.

---

## Componentes

### `Hero.tsx`
- Video `<video autoPlay muted loop playsInline>` con `src="/video/herov.mp4"`.
- Overlay: gradiente negro `rgba(0,0,0,0.45)` → `rgba(26,26,26,0.7)`.
- Título `ANA HAGEN`: fuente Bebas Neue, color transparente con `-webkit-text-stroke: 3px #FAF7F2`. "HAGEN" tiene underline rojo carmín (posición absoluta).
- Subtítulo: `DJ · Buenos Aires · Minimal Techno · House · Techno`.
- CTA "BOOKING": botón crema que al hover se llena de rojo carmín con transición `translate-x`. Hace scroll a `#booking`.
- Indicador de scroll: esquina inferior derecha, barra pulsante vertical.

### `Dates.tsx`
- Client component (`"use client"`).
- Fetch a Google Sheets vía `gviz/tq?tqx=out:json` — parsea el JSONP manualmente.
- **Estado pendiente**: `YOUR_SHEET_ID` en `SHEETS_URL` debe reemplazarse con el ID real.
- Columnas del Sheet: `Date | Venue | City | TicketLink` (la 5ª columna `FlierURL` está en las notas pero no implementada en el código actual).
- Estados: loading (skeleton), error, vacío ("PRÓXIMAMENTE"), lista de eventos.
- Cada evento: número de día en rojo carmín (Bebas Neue, `2.5rem`), mes/año en ink/40, nombre del venue, ciudad, y botón "ENTRADAS" o badge "FREE".

### `Videos.tsx`
- Server component (sin `"use client"`).
- 4 iframes de YouTube en grid `grid-cols-1 md:grid-cols-2`.
- Usa `youtube-nocookie.com` con `rel=0&modestbranding=1`.
- Cada iframe tiene `loading="lazy"` y un corner accent rojo carmín (cuadrado 4×4).

**YouTube IDs hardcodeados:**
```
SEHgRWobQVU
h7KmYYeH7zw
Sv6nqPmncFE
cZZQ21lkjdI
```

### `Booking.tsx`
- Fondo `bg-accent` (rojo carmín), sección `id="booking"`.
- Email `bookinganahagen@gmail.com` como enlace `mailto:` en fuente display grande (`clamp(1.5rem,4.5vw,3.5rem)`).
- Al hover: texto cambia a ink, underline crema que crece.
- Texto decorativo "BOOKING" de fondo a opacidad 7%.
- Grid SVG decorativo esquina inferior derecha.

### `Footer.tsx`
- Fondo `bg-ink`, texto `cream`.
- Copyright © 2025 Ana Hagen.
- Links sociales: actualmente solo Instagram.
- **Pendiente**: agregar SoundCloud y Resident Advisor cuando estén disponibles.

---

## Datos dinámicos — Google Sheets

### Setup requerido por la clienta

1. Crear un Google Sheet con estas columnas exactas (fila 1 = headers):

   | A | B | C | D |
   |---|---|---|---|
   | Date | Venue | City | TicketLink |

2. Compartir el sheet como "Anyone with the link → Viewer".
3. Copiar el ID del sheet (parte de la URL: `docs.google.com/spreadsheets/d/[ID]/edit`).
4. Reemplazar `YOUR_SHEET_ID` en `components/Dates.tsx` línea 14.

### Formato de datos
- **Date**: ISO (ej. `2025-06-15`) o texto legible.
- **TicketLink**: URL completa, o `—` para eventos gratuitos (mostrará badge "FREE").
- La fila de headers es ignorada automáticamente si `date === "date"`.

---

## Video del Hero

- Archivo: `public/video/herov.mp4` (~3 MB)
- **NO está en git** (en `.gitignore`)
- Se incluye automáticamente en cada `vercel --prod` porque el CLI sube todo `public/`
- Si se pierde el archivo local, hay que regenerarlo o pedírselo a la clienta

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

### Importante
- **GitHub** es solo backup de código — NO dispara deploys automáticos en Vercel.
- Los deploys siempre se hacen con `vercel --prod` desde la máquina local para que el video quede incluido.
- Si se hiciera deploy desde GitHub (sin el video en el repo), el hero quedaría sin video.

### Repositorio
- GitHub: https://github.com/ignaciobavala-png/ana-hagen.git

---

## Keep-alive Cron

- `vercel.json` define un cron `0 12 * * *` (12:00 UTC diario).
- Llama a `/api/keep-alive` → `app/api/keep-alive/route.ts` → responde `{ ok: true }`.
- Patrón estándar Petra Labs (aunque este proyecto no usa Supabase).

---

## SEO / Metadata

Definida en `app/layout.tsx`:
```
title: "Ana Hagen · DJ"
description: "Ana Hagen — DJ from Buenos Aires. Minimal Techno, House, Techno. Booking & upcoming dates."
openGraph: title + description + type: "website"
```

**Pendiente**: Agregar `app/opengraph-image` (imagen OG para compartir en redes).

---

## Pendientes

- [ ] Reemplazar `YOUR_SHEET_ID` en `Dates.tsx` con el ID real del Google Sheet de Ana
- [ ] Ana debe crear su Google Sheet con las columnas correctas y compartirlo públicamente
- [ ] Agregar SoundCloud link en `Footer.tsx` cuando esté disponible
- [ ] Agregar Resident Advisor link en `Footer.tsx` cuando esté disponible
- [ ] Agregar OG image (`app/opengraph-image`) para compartir en redes sociales
- [ ] Configurar dominio custom en Vercel dashboard
- [ ] Commitear `.gitignore` (tiene `.vercel` sin commitear — ver `git status`)

---

## Desarrollado por

Petra Labs · petralabs.xyz
