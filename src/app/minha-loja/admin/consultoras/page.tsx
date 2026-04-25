import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { ConsultorasTable } from "./consultoras-table";

export default async function ConsultorasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role !== "administrador") redirect("/minha-loja");

  const consultoras = await prisma.profile.findMany({
    where: { role: "consultora" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      cpf: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Consultoras</h1>
          <p className="mt-1 text-sm text-white/40">
            {consultoras.length}{" "}
            {consultoras.length === 1 ? "consultora cadastrada" : "consultoras cadastradas"}
          </p>
        </div>
        <Link
          href="/minha-loja/admin/consultoras/nova"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          + Nova consultora
        </Link>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/4">
        <ConsultorasTable consultoras={consultoras} />
      </div>
    </div>
  );
}
