"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { markAllRead } from "@/app/minha-loja/notificacoes/actions";

type Notif = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

export function NotificationBell({
  unreadCount,
  recent,
}: {
  unreadCount: number;
  recent: Notif[];
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(unreadCount);
  const ref = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && count > 0) {
      setCount(0);
      startTransition(() => markAllRead());
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/70"
        title="Notificações"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Notificações</title>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 z-50 w-72 rounded-xl border border-white/10 bg-[#100c1f] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-xs font-semibold text-white/70">
              Notificações
            </span>
            <Link
              href="/minha-loja/notificacoes"
              onClick={() => setOpen(false)}
              className="text-[10px] text-violet-400 hover:text-violet-300"
            >
              Ver todas
            </Link>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-white/30">
                Nenhuma notificação ainda.
              </p>
            ) : (
              recent.map((n) => (
                <div key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/5 px-4 py-3 transition last:border-0 hover:bg-white/5"
                    >
                      <NotifContent n={n} />
                    </Link>
                  ) : (
                    <div className="border-b border-white/5 px-4 py-3 last:border-0">
                      <NotifContent n={n} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/8 px-4 py-2.5">
            <Link
              href="/minha-loja/notificacoes"
              onClick={() => setOpen(false)}
              className="block text-center text-[11px] text-white/40 transition hover:text-white/70"
            >
              Ir para notificações →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifContent({ n }: { n: Notif }) {
  return (
    <>
      <p className="text-xs font-medium text-white/80">{n.title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
        {n.body}
      </p>
      <p className="mt-1 text-[10px] text-white/25">
        {n.createdAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </>
  );
}
