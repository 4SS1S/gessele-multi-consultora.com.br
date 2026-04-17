import type { OrderStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { StatusSelect } from "./components/status-select";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pendente: "bg-amber-500/15 text-amber-400",
  confirmado: "bg-sky-500/15 text-sky-400",
  enviado: "bg-violet-500/15 text-violet-400",
  entregue: "bg-emerald-500/15 text-emerald-400",
  cancelado: "bg-red-500/15 text-red-400",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default async function ConsultoraPedidosPage() {
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

  // Pedidos que contêm ao menos um produto da consultora
  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { consultoraId: user.id } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      comprador: { select: { fullName: true, email: true, phone: true } },
      items: {
        where: { product: { consultoraId: user.id } },
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pedidos recebidos</h1>
        <p className="mt-1 text-sm text-white/40">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} com seus
          produtos
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/4 py-20">
          <p className="text-sm text-white/40">Nenhum pedido recebido ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/8 bg-white/4"
            >
              {/* Cabeçalho do pedido */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                <div>
                  <p className="font-semibold text-white">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {order.createdAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                  <StatusSelect orderId={order.id} current={order.status} />
                </div>
              </div>

              {/* Comprador */}
              <div className="border-b border-white/5 px-5 py-3 text-xs text-white/50">
                <span className="text-white/30">Comprador: </span>
                {order.comprador.fullName || order.comprador.email}
                {order.comprador.phone && ` · ${order.comprador.phone}`}
              </div>

              {/* Itens */}
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-white/40">
                        {Number(item.productPrice).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-emerald-400">
                      {Number(item.subtotal).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total dos itens da consultora neste pedido */}
              <div className="flex justify-between border-t border-white/8 px-5 py-3">
                <span className="text-xs text-white/40">
                  Seus itens neste pedido
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {order.items
                    .reduce((acc, i) => acc + Number(i.subtotal), 0)
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
