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

  if (profile?.role === 'administrador') redirect('/minha-loja/admin')
  if (profile?.role === 'consultora') redirect('/minha-loja/consultora')
  if (profile?.role === 'comprador') redirect('/minha-loja/comprador')
  redirect('/auth/login')
}
