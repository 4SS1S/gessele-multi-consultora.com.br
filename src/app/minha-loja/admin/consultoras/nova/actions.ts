"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { validateCPF } from "@/lib/cpf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return profile?.role === "administrador";
}

export async function createConsultora(
  _prev: { error: string } | null,
  formData: FormData,
) {
  if (!(await assertAdmin())) return { error: "Não autorizado." };

  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const cpf = (formData.get("cpf") as string)?.trim() || null;

  if (!fullName) return { error: "O nome é obrigatório." };
  if (!email) return { error: "O e-mail é obrigatório." };
  if (!password) return { error: "A senha é obrigatória." };
  if (password !== confirm) return { error: "As senhas não coincidem." };
  if (password.length < 6)
    return { error: "A senha deve ter pelo menos 6 caracteres." };

  if (cpf) {
    if (!validateCPF(cpf)) return { error: "CPF inválido." };
    const existing = await prisma.profile.findUnique({ where: { cpf } });
    if (existing) return { error: "Este CPF já está cadastrado." };
  }

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, role: "consultora" },
  });

  if (error) {
    if (error.message.includes("already registered"))
      return { error: "Este e-mail já está cadastrado." };
    return { error: error.message };
  }

  if (cpf) {
    await prisma.profile.update({
      where: { id: data.user.id },
      data: { cpf, phone },
    });
  }

  redirect("/minha-loja/admin/consultoras");
}
