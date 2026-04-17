"use server";

import { revalidatePath } from "next/cache";
import { validateCPF } from "@/lib/cpf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

export type ProfileState = {
  success?: boolean;
  error?: string;
  field?: string;
} | null;

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const fullName = (formData.get("full_name") as string).trim();
  const phone = (formData.get("phone") as string).trim() || null;
  const cpf = (formData.get("cpf") as string).trim() || null;
  const avatarFile = formData.get("avatar") as File | null;
  const newPassword = (formData.get("new_password") as string).trim();
  const confirmPassword = (formData.get("confirm_password") as string).trim();

  if (!fullName) return { error: "O nome é obrigatório.", field: "full_name" };

  // Valida CPF se preenchido
  if (cpf) {
    if (!validateCPF(cpf)) {
      return {
        error: "CPF inválido. Verifique e tente novamente.",
        field: "cpf",
      };
    }
    const existing = await prisma.profile.findFirst({
      where: { cpf, NOT: { id: user.id } },
      select: { id: true },
    });
    if (existing)
      return {
        error: "Este CPF já está cadastrado por outro usuário.",
        field: "cpf",
      };
  }

  // Atualiza senha se preenchida
  if (newPassword) {
    if (newPassword.length < 6) {
      return {
        error: "A nova senha deve ter pelo menos 6 caracteres.",
        field: "new_password",
      };
    }
    if (newPassword !== confirmPassword) {
      return { error: "As senhas não coincidem.", field: "confirm_password" };
    }
    const { error: pwError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (pwError) return { error: pwError.message };
  }

  // Upload do avatar se fornecido
  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError)
      return { error: `Erro ao enviar imagem: ${uploadError.message}` };

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);
    avatarUrl = publicUrl;
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      fullName,
      phone,
      cpf,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
  });

  // Atualiza metadados no Supabase Auth também
  await supabase.auth.updateUser({
    data: { full_name: fullName, phone },
  });

  revalidatePath("/minha-loja/perfil");
  revalidatePath("/minha-loja");

  return { success: true };
}
