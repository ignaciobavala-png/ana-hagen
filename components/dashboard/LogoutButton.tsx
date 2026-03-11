'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="font-body text-xs tracking-[0.2em] uppercase text-cream/40 hover:text-accent transition-colors duration-200"
    >
      Cerrar sesión
    </button>
  )
}
