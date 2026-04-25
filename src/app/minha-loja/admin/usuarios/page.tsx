import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// type Role = "administrador" | "consultora" | "comprador";

// type UserSummary = {
//   fullName: string;
//   email: string;
//   role: Role;
//   createdAt: Date;
// };

export default async function UsuariosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role !== "administrador") redirect("/minha-loja");

  // const users = await prisma.profile.findMany({
  //   orderBy: { createdAt: "desc" },
  //   select: {
  //     fullName: true,
  //     email: true,
  //     role: true,
  //     createdAt: true,
  //   },
  //   take: 10,
  // });

  return (
    <div>
      <h1>Usuários</h1>
      <p>Em breve, a lista de usuários cadastrados.</p>
      {/* Aqui você pode mapear os usuários e exibi-los em uma tabela ou lista */}
    </div>
  );
}
