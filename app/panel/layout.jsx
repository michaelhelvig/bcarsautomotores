import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PanelSidebar from './PanelSidebar'

export default async function PanelLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-graphite">
      <PanelSidebar email={user.email} />

      <main className="md:ml-64 px-6 pt-6 pb-16">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}