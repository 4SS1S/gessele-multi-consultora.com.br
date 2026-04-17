import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { AddToCartButton } from "./components/add-to-cart-button";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== "comprador") redirect("/minha-loja");

  const products = await prisma.product.findMany({
    where: { quantity: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    include: { consultora: { select: { fullName: true } } },
  });

  // IDs dos produtos já no carrinho do comprador
  const cart = await prisma.cart.findUnique({
    where: { compradorId: user.id },
    select: { items: { select: { productId: true } } },
  });
  const inCartIds = new Set(cart?.items.map((i) => i.productId) ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogo</h1>
          <p className="mt-1 text-sm text-white/40">
            {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
            disponíve{products.length !== 1 ? "is" : "l"}
          </p>
        </div>
        <Link
          href="/minha-loja/comprador/carrinho"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
        >
          🛒 Carrinho
          {inCartIds.size > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {inCartIds.size}
            </span>
          )}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-white/4 py-20">
          <p className="text-sm text-white/40">
            Nenhum produto disponível no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition hover:border-white/15"
            >
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
                  <div className="flex h-full items-center justify-center text-4xl text-white/15">
                    📦
                  </div>
                )}
                {inCartIds.has(product.id) && (
                  <div className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    No carrinho
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="font-semibold text-white">{product.name}</p>
                <p className="mt-0.5 text-[10px] text-white/30">
                  por {product.consultora.fullName || "Consultora"}
                </p>
                {product.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-white/40">
                    {product.description}
                  </p>
                )}

                <div className="mt-auto pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-400">
                      {Number(product.price).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                      {product.quantity} em estoque
                    </span>
                  </div>
                  <AddToCartButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
