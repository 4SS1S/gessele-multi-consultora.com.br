'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

interface ProductFormProps {
  action: (formData: FormData) => void
  error?: string | null
  defaultValues?: {
    name?: string
    description?: string
    price?: number
    quantity?: number
    imageUrl?: string | null
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
    >
      {pending ? 'Salvando...' : label}
    </button>
  )
}

export function ProductForm({ action, error, defaultValues }: ProductFormProps) {
  const [preview, setPreview] = useState<string | null>(defaultValues?.imageUrl ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <form action={action} encType="multipart/form-data" className="space-y-6">
      {/* Imagem */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-white/70">Foto do produto</label>

        <div
          onClick={() => fileRef.current?.click()}
          className="relative flex h-52 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/4 transition hover:border-violet-500/50 hover:bg-white/6"
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={preview.startsWith('blob:')}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                <span className="text-xs font-medium text-white">Clique para trocar</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/30">
              <span className="text-3xl">📷</span>
              <span className="text-xs">Clique para adicionar foto</span>
              <span className="text-[10px]">JPG, PNG ou WebP · máx. 5 MB</span>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs font-medium text-white/70">
          Nome do produto <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="Ex: Creme hidratante facial"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium text-white/70">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ''}
          placeholder="Descreva o produto, ingredientes, modo de uso..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* Preço e Quantidade */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-xs font-medium text-white/70">
            Preço (R$) <span className="text-red-400">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0"
            step="0.01"
            defaultValue={defaultValues?.price}
            placeholder="0,00"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="quantity" className="block text-xs font-medium text-white/70">
            Quantidade em estoque <span className="text-red-400">*</span>
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            required
            min="0"
            step="1"
            defaultValue={defaultValues?.quantity}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Erro */}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}

      {/* Botões */}
      <div className="flex items-center gap-3">
        <SubmitButton label="Salvar produto" />
        <Link
          href="/crm/consultora/produtos"
          className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/50 transition hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
