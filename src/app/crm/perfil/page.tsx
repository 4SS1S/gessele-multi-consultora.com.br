import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'
import { ProfileForm } from './profile-form'

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      fullName: true,
      email: true,
      phone: true,
      cpf: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  })

  if (!profile) redirect('/auth/login')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="mt-1 text-sm text-white/50">
          Visualize e atualize as suas informações pessoais.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
