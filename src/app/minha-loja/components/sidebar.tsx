'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/auth/actions'

type Role = 'administrador' | 'consultora' | 'comprador'

interface NavItem {
  label: string
  href: string
}

const NAV: Record<Role, NavItem[]> = {
  administrador: [
    { label: 'Dashboard',    href: '/minha-loja/admin' },
    { label: 'Usuários',     href: '/minha-loja/admin/usuarios' },
    { label: 'Consultorias', href: '/minha-loja/admin/consultorias' },
    { label: 'Compradores',  href: '/minha-loja/admin/compradores' },
    { label: 'Relatórios',   href: '/minha-loja/admin/relatorios' },
  ],
  consultora: [
    { label: 'Dashboard',     href: '/minha-loja/consultora' },
    { label: 'Meus Clientes', href: '/minha-loja/consultora/clientes' },
    { label: 'Agenda',        href: '/minha-loja/consultora/agenda' },
    { label: 'Produtos',      href: '/minha-loja/consultora/produtos' },
    { label: 'Pedidos',       href: '/minha-loja/consultora/pedidos' },
  ],
  comprador: [
    { label: 'Dashboard',    href: '/minha-loja/comprador' },
    { label: 'Catálogo',     href: '/minha-loja/comprador/catalogo' },
    { label: 'Carrinho',     href: '/minha-loja/comprador/carrinho' },
    { label: 'Meus Pedidos', href: '/minha-loja/comprador/pedidos' },
  ],
}

const ROLE_LABEL: Record<Role, string> = {
  administrador: 'Administrador',
  consultora:    'Consultora',
  comprador:     'Comprador',
}

const ROLE_COLOR: Record<Role, string> = {
  administrador: 'bg-amber-500/15 text-amber-400',
  consultora:    'bg-violet-500/15 text-violet-400',
  comprador:     'bg-sky-500/15 text-sky-400',
}

interface SidebarProps {
  role: Role
  fullName: string
  email: string
  avatarUrl?: string | null
}

export function Sidebar({ role, fullName, email, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const items = NAV[role] ?? []
  const initials = (fullName || 'U').charAt(0).toUpperCase()

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/8 bg-[#0d0820]">
      {/* Brand */}
      <div className="border-b border-white/8 px-5 py-5">
        <p className="text-base font-bold text-white">Gessele Multi</p>
        <p className="text-xs text-white/40">CRM</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const base = `/minha-loja/${role}`
            const active =
              pathname === item.href ||
              (item.href !== base && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-violet-600/20 font-medium text-violet-300'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? 'bg-violet-400' : 'bg-white/20'
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/8 p-4 space-y-3">
        <Link
          href="/minha-loja/perfil"
          className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/5"
          title="Editar perfil"
        >
          {/* Avatar */}
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-violet-600/30">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName || 'Avatar'}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-violet-300">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">{fullName || 'Usuário'}</p>
            <p className="truncate text-[10px] text-white/40">{email}</p>
          </div>
        </Link>

        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_COLOR[role]}`}
          >
            {ROLE_LABEL[role]}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-white/8 px-3 py-1.5 text-xs text-white/40 transition hover:border-white/15 hover:text-white/70"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
