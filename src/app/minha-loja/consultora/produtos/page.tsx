import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { DeleteProductButton } from "./components/delete-button";

export default async function ProdutosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== "consultora") redirect("/minha-loja");

  const products = await prisma.product.findMany({
    where: { consultoraId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Produtos</h1>
          <p className="mt-1 text-sm text-white/40">
            {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
            cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/minha-loja/consultora/produtos/novo"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/4 py-20">
          <p className="text-sm text-white/40">
            Você ainda não cadastrou nenhum produto.
          </p>
          <Link
            href="/minha-loja/consultora/produtos/novo"
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Cadastrar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition hover:border-white/15"
            >
              {/* Imagem */}
              <div className="relative h-44 w-full overflow-hidden bg-white/5">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/15">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <p className="font-semibold text-white">{product.name}</p>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/40">
                    {product.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400">
                    {Number(product.price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      product.quantity > 0
                        ? "bg-sky-500/15 text-sky-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {product.quantity > 0
                      ? `${product.quantity} em estoque`
                      : "Sem estoque"}
                  </span>
                </div>

                {/* Ações */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/minha-loja/consultora/produtos/${product.id}/editar`}
                    className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-center text-xs text-white/60 transition hover:border-white/20 hover:text-white"
                  >
                    Editar
                  </Link>
                  <DeleteProductButton id={product.id} name={product.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
