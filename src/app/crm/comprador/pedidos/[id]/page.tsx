import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
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

const STEPS: OrderStatus[] = ['pendente', 'confirmado', 'enviado', 'entregue']

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const order = await prisma.order.findFirst({
    where: { id, compradorId: user.id },
    include: { items: { orderBy: { productName: 'asc' } } },
  })
  if (!order) notFound()

  const currentStep = STEPS.indexOf(order.status)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/crm/comprador/pedidos" className="text-xs text-white/40 hover:text-white/60">
          ← Meus pedidos
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Realizado em{' '}
            {order.createdAt.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Linha do tempo de status (apenas se não cancelado) */}
      {order.status !== 'cancelado' && (
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const done = idx <= currentStep
              const active = idx === currentStep
              return (
                <div key={step} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      done
                        ? 'bg-violet-600 text-white'
                        : 'border border-white/15 text-white/20'
                    }`}
                  >
                    {done && idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] text-center ${active ? 'text-violet-400 font-medium' : done ? 'text-white/60' : 'text-white/20'}`}
                  >
                    {STATUS_LABEL[step]}
                  </span>
                  {/* Linha conectora */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`absolute mt-3.5 h-0.5 w-full max-w-[calc(25%-1.75rem)] translate-x-[calc(50%+0.875rem)] ${
                        idx < currentStep ? 'bg-violet-600' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Itens do pedido */}
      <div className="rounded-2xl border border-white/8 bg-white/4">
        <div className="border-b border-white/8 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Itens do pedido</h2>
        </div>
        <div className="divide-y divide-white/5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl text-white/20">
                    📦
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{item.productName}</p>
                  <p className="text-xs text-white/40">
                    {Number(item.productPrice).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}{' '}
                    × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-emerald-400">
                  {Number(item.subtotal).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/8 px-6 py-4">
          <span className="font-semibold text-white">Total</span>
          <span className="text-lg font-bold text-emerald-400">
            {Number(order.total).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
