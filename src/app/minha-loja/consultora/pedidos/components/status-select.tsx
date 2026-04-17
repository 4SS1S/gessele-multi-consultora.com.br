"use client";

import type { OrderStatus } from "@prisma/client";
import { useTransition } from "react";
import { updateOrderStatus } from "../actions";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

interface StatusSelectProps {
  orderId: string;
  current: OrderStatus;
}

export function StatusSelect({ orderId, current }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as OrderStatus;
    startTransition(() => updateOrderStatus(orderId, status));
  }

  return (
    <select
      defaultValue={current}
      disabled={isPending}
      onChange={handleChange}
      className="rounded-lg border border-white/10 bg-[#0d0820] px-3 py-1.5 text-xs text-white/70 outline-none transition focus:border-violet-500 disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
