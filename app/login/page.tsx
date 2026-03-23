import { redirect } from 'next/navigation'

// Ruta vieja — redirigir al nuevo /admin
export default function LoginPage() {
  redirect('/admin')
}
