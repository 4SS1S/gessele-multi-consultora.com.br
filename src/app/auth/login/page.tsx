"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "../actions";
import { SocialButtons } from "../components/social-buttons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

function ErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
      {error === "auth_callback_failed"
        ? "Falha ao autenticar. Tente novamente."
        : "Erro ao entrar. Tente novamente."}
    </p>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0614] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Gessele Multi</h1>
          <p className="mt-1 text-sm text-white/50">Acesse sua conta</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md space-y-5">
          {/* Social login */}
          <SocialButtons label="Entrar" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-white/30">ou com e-mail</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Formulário e-mail/senha */}
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-white/70"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-white/70"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <Suspense fallback={null}>
              <ErrorBanner />
            </Suspense>

            {state?.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>

          <p className="text-center text-xs text-white/40">
            É comprador?{" "}
            <Link
              href="/auth/register"
              className="text-violet-400 transition hover:text-violet-300"
            >
              Crie sua conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
