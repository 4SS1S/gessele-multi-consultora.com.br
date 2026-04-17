/** biome-ignore-all lint/complexity/useOptionalChain: <explanation> */
"use server";

import { redirect } from "next/navigation";
import { validateCPF } from "@/lib/cpf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };

  redirect("/minha-loja");
}

export async function register(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;
  const cpf = formData.get("cpf") as string;
  const avatarFile = formData.get("avatar") as File | null;

  if (password !== confirm) return { error: "As senhas não coincidem." };

  // Valida CPF se preenchido
  if (cpf && cpf.trim()) {
    if (!validateCPF(cpf))
      return { error: "CPF inválido. Verifique e tente novamente." };

    // Verifica se CPF já está cadastrado
    const cpfFormatted = cpf.trim();
    const existing = await prisma.profile.findUnique({
      where: { cpf: cpfFormatted },
    });
    if (existing) return { error: "Este CPF já está cadastrado." };
  }

  // Cria usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
        phone: (formData.get("phone") as string) || null,
        role: "comprador",
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Erro ao criar usuário." };

  // Upload do avatar se fornecido
  let avatarUrl: string | null = null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${data.user.id}/avatar.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (!uploadError && uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);
      avatarUrl = publicUrl;
    }
  }

  // Atualiza o perfil criado pelo trigger com CPF e avatar
  await prisma.profile.update({
    where: { id: data.user.id },
    data: {
      cpf: cpf.trim() || null,
      avatarUrl,
    },
  });

  redirect("/minha-loja");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
