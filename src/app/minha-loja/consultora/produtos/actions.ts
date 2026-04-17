'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/server'

// ─── Helper: busca o usuário autenticado como consultora ─────────────────────
async function getConsultora() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  })
  if (profile?.role !== 'consultora') return null

  return { userId: user.id, supabase }
}

// ─── Helper: faz upload da imagem no Supabase Storage ────────────────────────
async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  userId: string
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error || !data) return null

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(data.path)

  return publicUrl
}

// ─── Criar produto ────────────────────────────────────────────────────────────
export async function createProduct(
  _prev: { error: string } | null,
  formData: FormData
) {
  const consultora = await getConsultora()
  if (!consultora) return { error: 'Não autorizado.' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const price = Number(formData.get('price'))
  const quantity = Number(formData.get('quantity'))
  const imageFile = formData.get('image') as File | null

  if (!name) return { error: 'O nome do produto é obrigatório.' }
  if (isNaN(price) || price < 0) return { error: 'Informe um preço válido.' }
  if (isNaN(quantity) || quantity < 0) return { error: 'Informe uma quantidade válida.' }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(consultora.supabase, imageFile, consultora.userId)
    if (!imageUrl) return { error: 'Erro ao fazer upload da imagem. Tente novamente.' }
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      quantity,
      imageUrl,
      consultoraId: consultora.userId,
    },
  })

  revalidatePath('/minha-loja/consultora/produtos')
  redirect('/minha-loja/consultora/produtos')
}

// ─── Atualizar produto ────────────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: { error: string } | null,
  formData: FormData
) {
  const consultora = await getConsultora()
  if (!consultora) return { error: 'Não autorizado.' }

  const existing = await prisma.product.findFirst({
    where: { id, consultoraId: consultora.userId },
    select: { imageUrl: true },
  })
  if (!existing) return { error: 'Produto não encontrado.' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const price = Number(formData.get('price'))
  const quantity = Number(formData.get('quantity'))
  const imageFile = formData.get('image') as File | null

  if (!name) return { error: 'O nome do produto é obrigatório.' }
  if (isNaN(price) || price < 0) return { error: 'Informe um preço válido.' }
  if (isNaN(quantity) || quantity < 0) return { error: 'Informe uma quantidade válida.' }

  let imageUrl = existing.imageUrl
  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadProductImage(consultora.supabase, imageFile, consultora.userId)
    if (!uploaded) return { error: 'Erro ao fazer upload da imagem. Tente novamente.' }
    imageUrl = uploaded
  }

  await prisma.product.update({
    where: { id },
    data: { name, description, price, quantity, imageUrl },
  })

  revalidatePath('/minha-loja/consultora/produtos')
  redirect('/minha-loja/consultora/produtos')
}

// ─── Excluir produto ──────────────────────────────────────────────────────────
export async function deleteProduct(id: string) {
  const consultora = await getConsultora()
  if (!consultora) return

  await prisma.product.deleteMany({
    where: { id, consultoraId: consultora.userId },
  })

  revalidatePath('/minha-loja/consultora/produtos')
}
