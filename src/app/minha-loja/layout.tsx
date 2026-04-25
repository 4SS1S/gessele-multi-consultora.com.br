import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { Sidebar } from "./components/sidebar";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profile, recentNotifications, unreadCount] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: user.id },
      select: { fullName: true, email: true, role: true, avatarUrl: true },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        body: true,
        href: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  if (!profile) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-[#080613] text-white">
      <Sidebar
        role={profile.role as Role}
        fullName={profile.fullName}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        unreadCount={unreadCount}
        recentNotifications={recentNotifications}
      />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
