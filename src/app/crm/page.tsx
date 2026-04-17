import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'

export default async function CrmPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role === 'administrador') redirect('/crm/admin')
  if (profile?.role === 'consultora') redirect('/crm/consultora')
  if (profile?.role === 'comprador') redirect('/crm/comprador')
  redirect('/auth/login')
}
