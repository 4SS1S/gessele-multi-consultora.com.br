"use client";

import { useActionState, useState, useTransition } from "react";
import { toggleConsultoraActive, updateConsultora } from "./actions";

type Consultora = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  active: boolean;
  createdAt: Date;
};

function EditModal({
  consultora,
  onClose,
}: {
  consultora: Consultora;
  onClose: () => void;
}) {
  const boundAction = updateConsultora.bind(null, consultora.id);
  const [state, action, pending] = useActionState(boundAction, null);

  if (state === null && !pending) {
    // fechado automaticamente após salvar com sucesso (state volta a null sem erro)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0820] p-6 shadow-xl">
        <h2 className="mb-5 text-base font-semibold text-white">
          Editar consultora
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-xs text-white/50"
              htmlFor="fullName"
            >
              Nome
            </label>
            <input
              name="fullName"
              defaultValue={consultora.fullName}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs text-white/50"
              htmlFor="phone"
            >
              Telefone
            </label>
            <input
              name="phone"
              defaultValue={consultora.phone ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50" htmlFor="cpf">
              CPF
            </label>
            <input
              name="cpf"
              defaultValue={consultora.cpf ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleConsultoraActive(id, !active))}
      className={`rounded-full px-3 py-1 text-[11px] font-medium transition disabled:opacity-50 ${
        active
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400"
          : "bg-red-500/15 text-red-400 hover:bg-emerald-500/15 hover:text-emerald-400"
      }`}
      title={active ? "Clique para desabilitar" : "Clique para habilitar"}
    >
      {isPending ? "..." : active ? "Ativa" : "Inativa"}
    </button>
  );
}

export function ConsultorasTable({
  consultoras,
}: {
  consultoras: Consultora[];
}) {
  const [editing, setEditing] = useState<Consultora | null>(null);

  return (
    <>
      {editing && (
        <EditModal consultora={editing} onClose={() => setEditing(null)} />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/40">
                Status
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {consultoras.map((c) => (
              <tr
                key={c.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/3"
              >
                <td className="px-6 py-3 font-medium text-white/90">
                  {c.fullName || "—"}
                </td>
                <td className="px-6 py-3 text-white/60">{c.email}</td>
                <td className="px-6 py-3 text-white/50">{c.phone || "—"}</td>
                <td className="px-6 py-3 text-white/50">{c.cpf || "—"}</td>
                <td className="px-6 py-3 text-white/40">
                  {c.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-3">
                  <ToggleButton id={c.id} active={c.active} />
                </td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/50 transition hover:border-violet-500/40 hover:text-violet-300"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {consultoras.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-white/30"
                >
                  Nenhuma consultora cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
