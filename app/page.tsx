import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Skip sign-up, go directly to dashboard
  redirect('/dashboard')
}
