import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's cases
  const { data: cases, error } = await supabase
    .from('transfusion_cases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching cases:', error)
  }

  // Get statistics
  const stats = {
    total: cases?.length || 0,
    drafts: cases?.filter(c => c.status === 'draft').length || 0,
    pendingReview: cases?.filter(c => c.status === 'pending_review').length || 0,
    completed: cases?.filter(c => c.status === 'completed' || c.status === 'submitted_to_rac').length || 0,
  }

  return (
    <DashboardContent 
      cases={cases || []} 
      stats={stats}
      userEmail={user.email || ''}
    />
  )
}
