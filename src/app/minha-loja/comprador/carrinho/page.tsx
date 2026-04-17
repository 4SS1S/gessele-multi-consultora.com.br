import Image from 'next/image'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'
import { CartItemControls } from './components/cart-item-controls'
import { CheckoutButton } from './components/checkout-button'

export default async function CarrinhoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (profile?.role !== 'comprador') redirect('/minha-loja')

  const cart = await prisma.cart.findUnique({
    where: { compradorId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, quantity: true, imageUrl: true },
          },
        },
        orderBy: { product: { name: 'asc' } },
      },
    },
  })

  const items = cart?.items ?? []
  const total = items.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Carrinho</h1>
        <p className="mt-1 text-sm text-white/40">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/4 py-20 gap-3">
          <span className="text-5xl">🛒</span>
          <p className="text-sm text-white/40">Seu carrinho está vazio.</p>
          <a
            href="/minha-loja/comprador/catalogo"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Ver catálogo
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                {/* Imagem */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20 text-2xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Dados */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white truncate">{item.product.name}</p>
                    <p className="shrink-0 font-bold text-emerald-400">
                      {(Number(item.product.price) * item.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-white/40">
                      {Number(item.product.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}{' '}
                      cada · {item.product.quantity} em estoque
                    </p>
                    <CartItemControls
                      itemId={item.id}
                      quantity={item.quantity}
                      maxQuantity={item.product.quantity}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do pedido */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 h-fit space-y-4">
            <h2 className="font-semibold text-white">Resumo do pedido</h2>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-white/60">
                  <span className="truncate mr-2">
                    {item.product.name} ×{item.quantity}
                  </span>
                  <span className="shrink-0">
                    {(Number(item.product.price) * item.quantity).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/8 pt-4 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-emerald-400 text-lg">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <CheckoutButton />

            <a
              href="/minha-loja/comprador/catalogo"
              className="block text-center text-xs text-white/40 transition hover:text-white/60"
            >
              Continuar comprando
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
