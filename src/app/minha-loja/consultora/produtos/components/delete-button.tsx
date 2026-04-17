'use client'

import { useTransition } from 'react'
import { deleteProduct } from '../actions'

interface DeleteProductButtonProps {
  id: string
  name: string
}

export function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    startTransition(() => deleteProduct(id))
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/70 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
    >
      {isPending ? '...' : 'Excluir'}
    </button>
  )
}
