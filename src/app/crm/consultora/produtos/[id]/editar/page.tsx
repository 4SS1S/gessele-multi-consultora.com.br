'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { updateProduct } from '../../actions'
import { ProductForm } from '../../components/product-form'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

interface ProductData {
  name: string
  description: string | null
  price: number
  quantity: number
  imageUrl: string | null
}

export default function EditarProdutoPage({ params }: EditProductPageProps) {
  const [productId, setProductId] = useState<string | null>(null)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)

  // Resolve params (Next.js 15: params is a Promise)
  useEffect(() => {
    params.then(({ id }) => setProductId(id))
  }, [params])

  // Fetch product data client-side via API route
  useEffect(() => {
    if (!productId) return
    fetch(`/api/produtos/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productId])

  const boundAction = productId
    ? updateProduct.bind(null, productId)
    : null

  const [state, action] = useActionState(
    boundAction ?? (async () => ({ error: 'Produto não encontrado.' })),
    null
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40 text-sm">
        Carregando...
      </div>
    )
  }

  if (!product && !loading) return notFound()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/crm/consultora/produtos"
          className="text-xs text-white/40 transition hover:text-white/60"
        >
          ← Voltar para produtos
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Editar produto</h1>
        <p className="mt-1 text-sm text-white/40">Altere as informações do produto.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
        <ProductForm
          action={action}
          error={state?.error}
          defaultValues={{
            name: product?.name,
            description: product?.description ?? undefined,
            price: product?.price,
            quantity: product?.quantity,
            imageUrl: product?.imageUrl,
          }}
        />
      </div>
    </div>
  )
}
