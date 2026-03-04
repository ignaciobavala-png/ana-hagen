# Ana Hagen — Sitio Web · Notas de Proyecto

## Cliente
- **Nombre:** Ana Hagen
- **Perfil:** DJ argentina, minimal techno, house, techno
- **Instagram:** https://www.instagram.com/anahagen__/
- **Email booking:** bookinganahagen@gmail.com

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Sin base de datos
- Deploy: Vercel CLI local (NO auto-deploy desde GitHub)

## Paleta de colores
- Acento: #C8102E (rojo carmín)
- Fondo: #FAF7F2 (crema cálida)
- Cards: #F2EDE6
- Texto: #1A1A1A
- Hover: #A00D24

## Estructura de componentes
- Hero.tsx — Video fullscreen local (/public/video/herov.mp4) + overlay + título
- Dates.tsx — Fechas desde Google Sheets (gviz JSON, client-side fetch)
- Videos.tsx — 4 iframes YouTube hardcodeados en grid 2x2
- Booking.tsx — Sección rojo carmín con mailto: link
- Footer.tsx — Instagram link + copyright

## Videos hardcodeados (YouTube IDs)
- SEHgRWobQVU
- h7KmYYeH7zw
- Sv6nqPmncFE
- cZZQ21lkjdI

## Video del Hero
- Archivo: public/video/herov.mp4 (3MB)
- NO está en git (.gitignore)
- Se sube a Vercel en cada deploy via CLI local
- Comando de deploy: vercel --prod (siempre desde la carpeta local del proyecto)

## Google Sheets — Fechas
- Columnas: Date | Venue | City | TicketLink | FlierURL
- El Sheet debe estar público (Anyone with the link → Viewer)
- Reemplazar YOUR_SHEET_ID en Dates.tsx con el ID real de Ana
- FlierURL: imágenes subidas a Cloudinary (cloudinary.com, plan gratuito)

## Keep-alive Cron
- vercel.json — cron diario a las 12:00 UTC
- app/api/keep-alive/route.ts — responde { ok: true }
- Previene que Supabase pause la DB (aunque este proyecto no usa Supabase, está como estándar Petra Labs)

## Pendientes
- [ ] Reemplazar YOUR_SHEET_ID en Dates.tsx con el ID real del Google Sheet de Ana
- [ ] Ana debe crear su Google Sheet con las columnas correctas y compartirlo públicamente
- [ ] Ana debe crear cuenta en Cloudinary para subir flyers
- [ ] Agregar SoundCloud link en Footer.tsx cuando esté disponible
- [ ] Agregar Resident Advisor link en Footer.tsx cuando esté disponible
- [ ] Agregar OG image (app/opengraph-image) para compartir en redes sociales
- [ ] Configurar dominio custom en Vercel dashboard
- [ ] Commitear .gitignore (tiene .vercel sin commitear)

## Comandos útiles
```bash
# Instalar dependencias
pnpm install

# Dev local
pnpm dev

# Deploy a producción (siempre desde local, incluye el video)
vercel --prod

# Push de cambios de código a GitHub (sin el video)
git add .
git commit -m "descripción"
git push
```

## Repositorio
- GitHub: https://github.com/ignaciobavala-png/ana-hagen.git
- GitHub es solo backup de código, NO dispara deploys automáticos

## Desarrollado por
Petra Labs · petralabs.xyz
