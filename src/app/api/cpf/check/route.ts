import { type NextRequest, NextResponse } from "next/server";
import { validateCPF } from "@/lib/cpf";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const cpf = req.nextUrl.searchParams.get("cpf") ?? "";

  if (!validateCPF(cpf)) {
    return NextResponse.json({
      valid: false,
      available: false,
      message: "CPF inválido.",
    });
  }

  const existing = await prisma.profile.findUnique({
    where: { cpf: cpf.trim() },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({
      valid: true,
      available: false,
      message: "Este CPF já está cadastrado.",
    });
  }

  return NextResponse.json({ valid: true, available: true, message: "" });
}
