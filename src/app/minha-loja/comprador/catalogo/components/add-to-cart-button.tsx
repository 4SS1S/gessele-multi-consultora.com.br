"use client";

import { useState, useTransition } from "react";
import { addToCart } from "../../carrinho/actions";

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if (!result?.error) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        added
          ? "bg-emerald-600/20 text-emerald-400"
          : "bg-violet-600 text-white hover:bg-violet-500"
      }`}
    >
      {isPending ? "..." : added ? "✓ Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
