"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== "administrador") return null;

  return user.id;
}

export async function updateConsultora(
  id: string,
  _prev: { error: string } | null,
  formData: FormData,
) {
  if (!(await assertAdmin())) return { error: "Não autorizado." };

  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const cpf = (formData.get("cpf") as string)?.trim() || null;

  if (!fullName) return { error: "O nome é obrigatório." };

  await prisma.profile.update({
    where: { id },
    data: { fullName, phone, cpf },
  });

  revalidatePath("/minha-loja/admin/consultoras");
  return null;
}

export async function toggleConsultoraActive(id: string, active: boolean) {
  if (!(await assertAdmin())) return;

  await prisma.profile.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/minha-loja/admin/consultoras");
}
