"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCPF, validateCPF } from "@/lib/cpf";
import { updateProfile } from "./actions";

const ROLE_LABEL = {
  administrador: "Administrador",
  consultora: "Consultora",
  comprador: "Comprador",
} as const;

const ROLE_COLOR = {
  administrador: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  consultora: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  comprador: "bg-sky-500/15 text-sky-400 border-sky-500/20",
} as const;

type Role = keyof typeof ROLE_LABEL;

interface Profile {
  fullName: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar alterações"}
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, null);

  const [cpfValue, setCpfValue] = useState(profile.cpf ?? "");
  const [cpfError, setCpfError] = useState("");
  const [cpfChecking, setCpfChecking] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const initials = (profile.fullName || "U").charAt(0).toUpperCase();
  const role = profile.role as Role;

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCPF(e.target.value);
    setCpfValue(formatted);
    if (formatted.length < 14) {
      setCpfError("");
      setCpfChecking(false);
    }
  }

  async function handleCpfBlur() {
    if (cpfValue.length === 14) {
      if (!validateCPF(cpfValue)) {
        setCpfError("CPF inválido.");
        return;
      }
      setCpfChecking(true);
      setCpfError("");
      try {
        const res = await fetch(
          `/api/cpf/check?cpf=${encodeURIComponent(cpfValue)}`,
        );
        const data = await res.json();
        // If it's the user's own CPF, the server action handles the "same owner" check
        // The API just checks existence — we ignore "already registered" here and let
        // the server action decide (it skips the current user)
        if (!data.valid) setCpfError(data.message ?? "CPF inválido.");
      } catch {
        // ignore
      } finally {
        setCpfChecking(false);
      }
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  const memberSince = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <Tabs defaultValue="dados" className="space-y-4">
      <TabsList className="bg-white/5 border border-white/10">
        <TabsTrigger
          value="dados"
          className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50"
        >
          Dados pessoais
        </TabsTrigger>
        <TabsTrigger
          value="seguranca"
          className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50"
        >
          Segurança
        </TabsTrigger>
      </TabsList>

      <form action={action}>
        {/* ── Tab: dados pessoais ── */}
        <TabsContent value="dados" className="space-y-4 mt-0">
          {/* Card: avatar + identidade */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Foto e identidade</CardTitle>
              <CardDescription className="text-white/40">
                Membro desde {memberSince}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    className="group relative"
                    title="Alterar foto"
                  >
                    <Avatar className="h-20 w-20 ring-2 ring-violet-500/30 ring-offset-2 ring-offset-[#0d0820]">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Preview" />
                      ) : (
                        <AvatarImage
                          src={profile.avatarUrl ?? undefined}
                          alt={profile.fullName}
                        />
                      )}
                      <AvatarFallback className="bg-violet-600/30 text-violet-300 text-xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                      <span className="text-[10px] text-white font-medium">
                        Alterar
                      </span>
                    </div>
                  </button>
                  <input
                    ref={avatarRef}
                    type="file"
                    name="avatar"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {profile.fullName || "Sem nome"}
                  </p>
                  <p className="text-sm text-white/50">{profile.email}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium px-2 py-0.5 ${ROLE_COLOR[role] ?? ""}`}
                  >
                    {ROLE_LABEL[role] ?? profile.role}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-white/8" />

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs text-white/70">
                  Nome completo <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile.fullName}
                  required
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  className="border-white/10 bg-white/5 text-white placeholder-white/20 focus-visible:ring-violet-500"
                />
                {state?.field === "full_name" && (
                  <p className="text-[11px] text-red-400">{state.error}</p>
                )}
              </div>

              {/* E-mail — somente leitura */}
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">E-mail</Label>
                <Input
                  value={profile.email}
                  readOnly
                  className="border-white/10 bg-white/5 text-white/40 cursor-default select-none"
                />
                <p className="text-[11px] text-white/25">
                  O e-mail não pode ser alterado.
                </p>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-white/70">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  type="tel"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  className="border-white/10 bg-white/5 text-white placeholder-white/20 focus-visible:ring-violet-500"
                />
              </div>

              {/* CPF */}
              <div className="space-y-1.5">
                <Label htmlFor="cpf" className="text-xs text-white/70">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpfValue}
                  onChange={handleCpfChange}
                  onBlur={handleCpfBlur}
                  maxLength={14}
                  className={`border-white/10 bg-white/5 text-white placeholder-white/20 focus-visible:ring-violet-500 ${
                    cpfError || state?.field === "cpf"
                      ? "border-red-500/50 bg-red-500/5 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {cpfChecking && (
                  <p className="text-[11px] text-white/40">
                    Verificando CPF...
                  </p>
                )}
                {!cpfChecking && cpfError && (
                  <p className="text-[11px] text-red-400">{cpfError}</p>
                )}
                {!cpfChecking && !cpfError && state?.field === "cpf" && (
                  <p className="text-[11px] text-red-400">{state.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback geral */}
          {state?.success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              Perfil atualizado com sucesso!
            </div>
          )}
          {state?.error && !state.field && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div className="flex justify-end">
            <SaveButton />
          </div>
        </TabsContent>

        {/* ── Tab: segurança ── */}
        <TabsContent value="seguranca" className="space-y-4 mt-0">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Alterar senha</CardTitle>
              <CardDescription className="text-white/40">
                Deixe em branco para manter a senha atual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_password" className="text-xs text-white/70">
                  Nova senha
                </Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="border-white/10 bg-white/5 text-white placeholder-white/20 focus-visible:ring-violet-500"
                />
                {state?.field === "new_password" && (
                  <p className="text-[11px] text-red-400">{state.error}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm_password"
                  className="text-xs text-white/70"
                >
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  className="border-white/10 bg-white/5 text-white placeholder-white/20 focus-visible:ring-violet-500"
                />
                {state?.field === "confirm_password" && (
                  <p className="text-[11px] text-red-400">{state.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          {state?.success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              {/* Only show password success if something was typed; we can't know client-side easily */}
              Alterações salvas com sucesso!
            </div>
          )}
          {state?.error && !state.field && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div className="flex justify-end">
            <SaveButton />
          </div>
        </TabsContent>
      </form>
    </Tabs>
  );
}
