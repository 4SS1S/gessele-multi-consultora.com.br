'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'

// ─── Helper: valida comprador autenticado ─────────────────────────────────────
async function getComprador() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  })
  if (profile?.role !== 'comprador') return null
  return profile.id
}

// ─── Adicionar ao carrinho ────────────────────────────────────────────────────
export async function addToCart(productId: string, quantity = 1) {
  const compradorId = await getComprador()
  if (!compradorId) return { error: 'Não autorizado.' }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, quantity: true },
  })
  if (!product || product.quantity < 1) return { error: 'Produto indisponível.' }

  // Busca ou cria o carrinho do comprador
  const cart = await prisma.cart.upsert({
    where: { compradorId },
    create: { compradorId },
    update: {},
    select: { id: true },
  })

  // Verifica se já existe o item no carrinho
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    select: { id: true, quantity: true },
  })

  const newQty = (existing?.quantity ?? 0) + quantity
  if (newQty > product.quantity) return { error: 'Quantidade maior que o estoque disponível.' }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    })
  }

  revalidatePath('/crm/comprador/carrinho')
  revalidatePath('/crm/comprador/catalogo')
  return { success: true }
}

// ─── Atualizar quantidade de item ─────────────────────────────────────────────
export async function updateCartItem(itemId: string, quantity: number) {
  const compradorId = await getComprador()
  if (!compradorId) return

  if (quantity <= 0) {
    await removeCartItem(itemId)
    return
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { compradorId } },
    include: { product: { select: { quantity: true } } },
  })
  if (!item) return
  if (quantity > item.product.quantity) return

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
  revalidatePath('/crm/comprador/carrinho')
}

// ─── Remover item do carrinho ─────────────────────────────────────────────────
export async function removeCartItem(itemId: string) {
  const compradorId = await getComprador()
  if (!compradorId) return

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { compradorId } },
  })
  revalidatePath('/crm/comprador/carrinho')
}

// ─── Finalizar pedido (checkout) ──────────────────────────────────────────────
export async function checkout() {
  const compradorId = await getComprador()
  if (!compradorId) return { error: 'Não autorizado.' }

  const cart = await prisma.cart.findUnique({
    where: { compradorId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, price: true, quantity: true, imageUrl: true } },
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) return { error: 'Seu carrinho está vazio.' }

  // Valida estoque e calcula total
  for (const item of cart.items) {
    if (item.quantity > item.product.quantity) {
      return {
        error: `"${item.product.name}" tem apenas ${item.product.quantity} unidades disponíveis.`,
      }
    }
  }

  const total = cart.items.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  )

  // Cria pedido em transação: order + orderItems + decrementa estoque + limpa carrinho
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        compradorId,
        total,
        status: 'pendente',
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productPrice: item.product.price,
            productImage: item.product.imageUrl,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity,
          })),
        },
      },
    })

    // Decrementa estoque de cada produto
    await Promise.all(
      cart.items.map((item) =>
        tx.product.update({
          where: { id: item.product.id },
          data: { quantity: { decrement: item.quantity } },
        })
      )
    )

    // Limpa os itens do carrinho
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return newOrder
  })

  revalidatePath('/crm/comprador/carrinho')
  revalidatePath('/crm/comprador/pedidos')
  revalidatePath('/crm/comprador/catalogo')
  redirect(`/crm/comprador/pedidos/${order.id}`)
}
