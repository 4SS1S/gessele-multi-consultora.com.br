"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createConsultora } from "./actions";

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/50" htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-violet-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-violet-500/50 focus:outline-none"
      />
    </div>
  );
}

export default function NovaConsultoraPage() {
  const [state, action, pending] = useActionState(createConsultora, null);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/minha-loja/admin/consultoras"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:text-white/70"
        >
          ← Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nova consultora</h1>
          <p className="mt-0.5 text-sm text-white/40">
            Crie uma conta de consultora na plataforma.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
        <form action={action} className="space-y-4">
          <Field label="Nome completo" name="fullName" required />
          <Field label="E-mail" name="email" type="email" required />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Senha"
              name="password"
              type="password"
              required
              placeholder="Mín. 6 caracteres"
            />
            <Field
              label="Confirmar senha"
              name="confirm"
              type="password"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Telefone"
              name="phone"
              placeholder="(11) 99999-9999"
            />
            <Field label="CPF" name="cpf" placeholder="000.000.000-00" />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/minha-loja/admin/consultoras"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {pending ? "Criando..." : "Criar consultora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
