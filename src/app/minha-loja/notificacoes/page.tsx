import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { markAllRead } from "./actions";

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificações</h1>
          <p className="mt-1 text-sm text-white/40">
            {notifications.length === 0
              ? "Nenhuma notificação"
              : `${notifications.length} notificação${notifications.length > 1 ? "ões" : ""}`}
          </p>
        </div>
        {hasUnread && (
          <form action={markAllRead}>
            <button
              type="submit"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:text-white/70"
            >
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4">
        {notifications.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/30">
            Você não tem notificações ainda.
          </p>
        ) : (
          <ul>
            {notifications.map((n, i) => (
              <li
                key={n.id}
                className={`border-b border-white/5 last:border-0 ${!n.read ? "bg-violet-500/5" : ""}`}
              >
                {n.href ? (
                  <Link
                    href={n.href}
                    className="flex items-start gap-3 px-6 py-4 transition hover:bg-white/3"
                  >
                    <NotifDot read={n.read} />
                    <NotifBody n={n} />
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-6 py-4">
                    <NotifDot read={n.read} />
                    <NotifBody n={n} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotifDot({ read }: { read: boolean }) {
  return (
    <span
      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? "bg-white/10" : "bg-violet-400"}`}
    />
  );
}

function NotifBody({
  n,
}: {
  n: { title: string; body: string; createdAt: Date };
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-white/85">{n.title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-white/50">{n.body}</p>
      <p className="mt-1.5 text-[10px] text-white/25">
        {n.createdAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
