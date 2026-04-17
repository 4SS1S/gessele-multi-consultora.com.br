import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

export default async function CompradorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { fullName: true, role: true },
  });

  if (profile?.role !== "comprador") redirect("/minha-loja");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, {profile.fullName || "Comprador"}
        </h1>
        <p className="mt-1 text-sm text-white/40">Seu painel de compras</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="text-xs font-medium text-white/50">
            Pedidos realizados
          </p>
          <p className="mt-2 text-3xl font-bold text-sky-400">0</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="text-xs font-medium text-white/50">Em andamento</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">0</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="text-xs font-medium text-white/50">Favoritos</p>
          <p className="mt-2 text-3xl font-bold text-pink-400">0</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4">
        <div className="border-b border-white/8 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Pedidos recentes</h2>
        </div>
        <div className="px-6 py-10 text-center text-sm text-white/30">
          Você ainda não fez nenhum pedido.
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4">
        <div className="border-b border-white/8 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">
            Produtos em destaque
          </h2>
        </div>
        <div className="px-6 py-10 text-center text-sm text-white/30">
          Nenhum produto disponível no momento.
        </div>
      </div>
    </div>
  );
}
