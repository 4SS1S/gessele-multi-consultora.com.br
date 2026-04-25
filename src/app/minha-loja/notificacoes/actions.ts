"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function markAllRead() {
  const userId = await getUserId();
  if (!userId) return;
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  revalidatePath("/minha-loja/notificacoes");
}

export async function markOneRead(id: string) {
  const userId = await getUserId();
  if (!userId) return;
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  revalidatePath("/minha-loja/notificacoes");
}
