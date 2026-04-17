"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== "consultora" && profile?.role !== "administrador")
    return;

  // Garante que a consultora só atualiza pedidos com produtos dela
  if (profile.role === "consultora") {
    const hasItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        product: { consultoraId: user.id },
      },
    });
    if (!hasItem) return;
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/minha-loja/consultora/pedidos");
}
