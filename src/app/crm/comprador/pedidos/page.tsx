import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'
import type { OrderStatus } from '@prisma/client'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente:   'Pendente',
  confirmado: 'Confirmado',
  enviado:    'Enviado',
  entregue:   'Entregue',
  cancelado:  'Cancelado',
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pendente:   'bg-amber-500/15 text-amber-400',
  confirmado: 'bg-sky-500/15 text-sky-400',
  enviado:    'bg-violet-500/15 text-violet-400',
  entregue:   'bg-emerald-500/15 text-emerald-400',
  cancelado:  'bg-red-500/15 text-red-400',
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (profile?.role !== 'comprador') redirect('/crm')

  const orders = await prisma.order.findMany({
    where: { compradorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { select: { quantity: true, subtotal: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Pedidos</h1>
        <p className="mt-1 text-sm text-white/40">
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizado{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/4 py-20 gap-3">
          <span className="text-5xl">📋</span>
          <p className="text-sm text-white/40">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/crm/comprador/catalogo"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0)
            return (
              <Link
                key={order.id}
                href={`/crm/comprador/pedidos/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-5 py-4 transition hover:border-white/15 hover:bg-white/6"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {order.createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    · {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {Number(order.total).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                  <span className="text-white/20">›</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
