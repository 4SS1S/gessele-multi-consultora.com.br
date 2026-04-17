'use client'

import { useTransition } from 'react'
import { checkout } from '../actions'

export function CheckoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => { void checkout() })}
      className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
    >
      {isPending ? 'Processando...' : 'Finalizar pedido'}
    </button>
  )
}
