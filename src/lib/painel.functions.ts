import { createServerFn } from "@tanstack/react-start";

import { VALOR_GUIA } from "@/lib/guia.constants";
import { ETAPAS_FUNIL, ROTULO_ETAPA } from "@/lib/funil.constants";

export type EtapaPainel = {
  chave: string;
  rotulo: string;
  total: number;
};

export type LeadPainel = {
  id: string;
  nome: string;
  email: string;
  status: string;
  criadoEm: string;
};

export type ResumoPainel = {
  leads: number;
  pagos: number;
  pendentes: number;
  perdidos: number;
  conversao: number;
  receita: number;
  leadsHoje: number;
  pagosHoje: number;
};

/**
 * Lista os pedidos para o painel. Reaproveita a sessão do /admin/upload-guia:
 * quem não passou pela senha não recebe nada.
 */
export const listarLeads = createServerFn({ method: "GET" }).handler(async () => {
  const { adminSession } = await import("./admin-guia.server");
  const session = await adminSession();
  if (!session.data.unlocked) {
    return { autorizado: false as const, leads: [], resumo: null, funil: [] };
  }

  const { firebaseFetch } = await import("./firebase.server");
  const [respPedidos, respFunil] = await Promise.all([
    firebaseFetch("/pedidos.json"),
    firebaseFetch("/funil.json"),
  ]);

  const bruto = (await respPedidos.json()) as Record<
    string,
    Omit<LeadPainel, "id">
  > | null;

  const visitantes = (await respFunil.json()) as Record<
    string,
    Record<string, string>
  > | null;

  const leads: LeadPainel[] = Object.entries(bruto ?? {})
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));

  const pagos = leads.filter((l) => l.status === "pago").length;
  const pendentes = leads.filter((l) => l.status === "pendente").length;

  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);
  const deHoje = (l: LeadPainel) => new Date(l.criadoEm) >= inicioDoDia;

  const resumo: ResumoPainel = {
    leads: leads.length,
    pagos,
    pendentes,
    perdidos: leads.length - pagos - pendentes,
    conversao: leads.length ? (pagos / leads.length) * 100 : 0,
    receita: pagos * VALOR_GUIA,
    leadsHoje: leads.filter(deHoje).length,
    pagosHoje: leads.filter((l) => deHoje(l) && l.status === "pago").length,
  };

  // Etapas de navegação vêm do /funil; as duas de dinheiro vêm dos pedidos,
  // que são a fonte autoritativa.
  const registros = Object.values(visitantes ?? {});
  const funil: EtapaPainel[] = [
    ...ETAPAS_FUNIL.map((etapa) => ({
      chave: etapa,
      rotulo: ROTULO_ETAPA[etapa],
      total: registros.filter((r) => r[etapa]).length,
    })),
    { chave: "pix", rotulo: "Gerou o PIX", total: leads.length },
    { chave: "pago", rotulo: "Pagou", total: pagos },
  ];

  return { autorizado: true as const, leads, resumo, funil };
});
