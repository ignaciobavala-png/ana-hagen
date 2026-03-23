# Ana Hagen — Sitio Web · Notas de Proyecto

## Cliente
- **Nombre:** Ana Hagen
- **Perfil:** DJ argentina, minimal techno, house, techno
- **Instagram:** https://www.instagram.com/anahagen__/
- **Email booking:** bookinganahagen@gmail.com

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- Deploy: Vercel CLI local (NO auto-deploy desde GitHub)

## Paleta de colores
- Acento: #C8102E (rojo carmín)
- Fondo: #FAF7F2 (crema cálida)
- Cards: #F2EDE6
- Texto: #1A1A1A
- Hover: #A00D24

## Videos hardcodeados (YouTube IDs)
Editables en `components/Videos.tsx` → array `VIDEO_IDS`:
- SEHgRWobQVU
- h7KmYYeH7zw
- Sv6nqPmncFE
- cZZQ21lkjdI

## Video del Hero
- Archivo: public/video/herov.mp4 (~3 MB)
- NO está en git (.gitignore)
- Se sube a Vercel en cada deploy via CLI local (`vercel --prod`)
- Alternativa: subir desde /dashboard/hero → queda en Supabase Storage

## Supabase — Setup inicial
1. Ir a https://supabase.com/dashboard → SQL Editor
2. Ejecutar `supabase/setup.sql` completo
3. Ejecutar `supabase/contact_config.sql` completo
4. Authentication → Users → Add user (crear cuenta admin)

## Keep-alive Cron
- vercel.json — cron diario a las 12:00 UTC
- app/api/keep-alive/route.ts — responde { ok: true }
- Previene que Supabase pause el proyecto por inactividad (plan gratuito)

## Pendientes
- [ ] Aplicar schema en Supabase (setup.sql + contact_config.sql)
- [ ] Crear usuario admin en Supabase Auth
- [ ] Configurar env vars en Vercel Dashboard
- [ ] Agregar OG image (app/opengraph-image)
- [ ] Configurar dominio custom en Vercel dashboard
- [ ] Agregar SoundCloud link cuando Ana lo tenga
- [ ] Agregar Resident Advisor link cuando Ana lo tenga

## Comandos útiles
```bash
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
