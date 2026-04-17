'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { formatCPF, validateCPF } from '@/lib/cpf'
import { register } from '../actions'
import { SocialButtons } from '../components/social-buttons'

function SubmitButton({ cpfChecking, cpfError }: { cpfChecking: boolean; cpfError: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || cpfChecking || !!cpfError}
      className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
    >
      {pending ? 'Criando conta...' : 'Criar conta'}
    </button>
  )
}

export default function RegisterPage() {
  const [state, action] = useActionState(register, null)
  const [cpfValue, setCpfValue] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [cpfChecking, setCpfChecking] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  async function checkCpf(formatted: string) {
    if (!validateCPF(formatted)) {
      setCpfError('CPF inválido.')
      return
    }
    setCpfChecking(true)
    setCpfError('')
    try {
      const res = await fetch(`/api/cpf/check?cpf=${encodeURIComponent(formatted)}`)
      const data = await res.json()
      setCpfError(data.message ?? '')
    } catch {
      // silently ignore network errors — server action will validate on submit
    } finally {
      setCpfChecking(false)
    }
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCPF(e.target.value)
    setCpfValue(formatted)
    if (formatted.length < 14) {
      setCpfError('')
      setCpfChecking(false)
    }
  }

  async function handleCpfBlur() {
    if (cpfValue.length === 14) {
      await checkCpf(cpfValue)
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0614] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Gessele Multi</h1>
          <p className="mt-1 text-sm text-white/50">Cadastro de Comprador</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md space-y-5">
          {/* Social register */}
          <div className="space-y-2">
            <p className="text-xs text-white/50 text-center">
              Cadastre-se rapidamente usando sua rede social
            </p>
            <SocialButtons label="Cadastrar" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-white/30">ou preencha os dados</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <form action={action} className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="relative group"
              >
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-white/15 bg-white/5 transition group-hover:border-violet-500/50">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-white/20">
                      📷
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white">
                  +
                </div>
              </button>
              <p className="text-[10px] text-white/30">Foto opcional</p>
              <input
                ref={avatarRef}
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-xs font-medium text-white/70">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-white/70">
                E-mail <span className="text-red-400">*</span>
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

            {/* CPF */}
            <div className="space-y-1.5">
              <label htmlFor="cpf" className="block text-xs font-medium text-white/70">
                CPF
              </label>
              <input
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
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:ring-1 ${
                  cpfError
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500'
                    : 'border-white/10 bg-white/5 focus:border-violet-500 focus:ring-violet-500'
                }`}
              />
              {cpfChecking && (
                <p className="text-[11px] text-white/40">Verificando CPF...</p>
              )}
              {!cpfChecking && cpfError && (
                <p className="text-[11px] text-red-400">{cpfError}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-medium text-white/70">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-white/70">
                Senha <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <label htmlFor="confirm_password" className="block text-xs font-medium text-white/70">
                Confirmar senha <span className="text-red-400">*</span>
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repita a senha"
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {state.error}
              </p>
            )}

            <SubmitButton cpfChecking={cpfChecking} cpfError={cpfError} />
          </form>

          <p className="text-center text-xs text-white/40">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-violet-400 transition hover:text-violet-300">
              Entrar
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          O cadastro é exclusivo para compradores.
          <br />
          Administradores e consultoras são cadastrados pela equipe.
        </p>
      </div>
    </div>
  )
}
