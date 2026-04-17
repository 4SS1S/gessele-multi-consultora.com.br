'use client'

import { useTransition } from 'react'
import { removeCartItem, updateCartItem } from '../actions'

interface CartItemControlsProps {
  itemId: string
  quantity: number
  maxQuantity: number
}

export function CartItemControls({ itemId, quantity, maxQuantity }: CartItemControlsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isPending || quantity <= 1}
        onClick={() => startTransition(() => updateCartItem(itemId, quantity - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-sm text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center text-sm text-white">{quantity}</span>
      <button
        type="button"
        disabled={isPending || quantity >= maxQuantity}
        onClick={() => startTransition(() => updateCartItem(itemId, quantity + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-sm text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-30"
      >
        +
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => removeCartItem(itemId))}
        className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 text-xs text-red-400/60 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-30"
        title="Remover item"
      >
        ✕
      </button>
    </div>
  )
}
