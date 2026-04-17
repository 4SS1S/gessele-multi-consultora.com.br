import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'

interface StatCardProps {
  label: string
  value: string | number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

const ROLE_STYLES: Record<string, string> = {
  administrador: 'bg-amber-500/15 text-amber-400',
  consultora: 'bg-violet-500/15 text-violet-400',
  comprador: 'bg-sky-500/15 text-sky-400',
}

const ROLE_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  consultora: 'Consultora',
  comprador: 'Comprador',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'administrador') redirect('/minha-loja')

  const [totalUsers, totalCompradores, totalConsultoras, recentUsers] =
    await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: 'comprador' } }),
      prisma.profile.count({ where: { role: 'consultora' } }),
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { fullName: true, email: true, role: true, createdAt: true },
      }),
    ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total de usuários" value={totalUsers} color="text-white" />
        <StatCard label="Compradores" value={totalCompradores} color="text-sky-400" />
        <StatCard label="Consultoras" value={totalConsultoras} color="text-violet-400" />
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4">
        <div className="border-b border-white/8 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Usuários recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr
                  key={u.email}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3"
                >
                  <td className="px-6 py-3 text-white/80">{u.fullName || '—'}</td>
                  <td className="px-6 py-3 text-white/60">{u.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLES[u.role] ?? 'bg-white/10 text-white/50'}`}
                    >
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-white/40">
                    {u.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-white/30">
                    Nenhum usuário cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
