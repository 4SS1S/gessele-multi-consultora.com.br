"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct } from "../actions";
import { ProductForm } from "../components/product-form";

export default function NovoProdutoPage() {
  const [state, action] = useActionState(createProduct, null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/minha-loja/consultora/produtos"
          className="text-xs text-white/40 transition hover:text-white/60"
        >
          ← Voltar para produtos
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Novo produto</h1>
        <p className="mt-1 text-sm text-white/40">
          Preencha as informações do produto que deseja cadastrar.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
        <ProductForm action={action} error={state?.error} />
      </div>
    </div>
  );
}
