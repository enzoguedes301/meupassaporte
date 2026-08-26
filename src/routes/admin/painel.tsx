import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Download,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { entrarAdmin, sairAdmin } from "@/lib/admin-guia.functions";
import {
  listarLeads,
  type EtapaPainel,
  type LeadPainel,
  type ResumoPainel,
} from "@/lib/painel.functions";

export const Route = createFileRoute("/admin/painel")({
  ssr: false,
  component: Painel,
  head: () => ({
    meta: [
      { title: "Painel de leads — Área restrita" },
      { name: "description", content: "Acompanhamento de leads e vendas do Guia do Passaporte." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ESTILO_STATUS: Record<string, string> = {
  pago: "bg-success/10 text-success border-success/30",
  pendente: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  falhou: "bg-destructive/10 text-destructive border-destructive/30",
  estornado: "bg-muted text-muted-foreground border-border",
};

function Painel() {
  const entrar = useServerFn(entrarAdmin);
  const sair = useServerFn(sairAdmin);
  const listar = useServerFn(listarLeads);

  const [carregando, setCarregando] = useState(true);
  const [liberado, setLiberado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const [leads, setLeads] = useState<LeadPainel[]>([]);
  const [resumo, setResumo] = useState<ResumoPainel | null>(null);
  const [funil, setFunil] = useState<EtapaPainel[]>([]);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pago" | "pendente">("todos");

  async function atualizar() {
    setAtualizando(true);
    try {
      const r = await listar({});
      setLiberado(r.autorizado);
      setLeads(r.leads);
      setResumo(r.resumo);
      setFunil(r.funil);
    } finally {
      setAtualizando(false);
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        await atualizar();
      } finally {
        setCarregando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onEntrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      const r = await entrar({ data: { senha } });
      if (!r.ok) {
        setErro("Senha incorreta.");
        return;
      }
      setSenha("");
      await atualizar();
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEntrando(false);
    }
  }

  async function onSair() {
    await sair({});
    setLiberado(false);
    setLeads([]);
    setResumo(null);
    setFunil([]);
  }

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtro !== "todos" && l.status !== filtro) return false;
      if (!termo) return true;
      return (
        l.nome.toLowerCase().includes(termo) || l.email.toLowerCase().includes(termo)
      );
    });
  }, [leads, busca, filtro]);

  function exportarCsv() {
    const escapar = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const linhas = [
      ["nome", "email", "status", "criado_em"].join(","),
      ...visiveis.map((l) =>
        [l.nome, l.email, l.status, l.criadoEm].map(escapar).join(","),
      ),
    ];
    // BOM para o Excel abrir os acentos corretamente.
    const blob = new Blob(["﻿" + linhas.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (carregando) {
    return (
      <>
        <GovHeader />
        <main className="flex min-h-screen items-center justify-center bg-muted/40">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        </main>
        <GovFooter />
      </>
    );
  }

  if (!liberado) {
    return (
      <>
        <GovHeader />
        <main className="min-h-screen bg-muted/40 pb-16">
          <div className="gov-stripe h-1" aria-hidden />
          <div className="mx-auto w-full max-w-md px-4 py-20">
            <form
              onSubmit={onEntrar}
              className="rounded-lg border border-border bg-card p-8"
            >
              <Lock className="mx-auto size-8 text-primary" aria-hidden />
              <h1 className="mt-4 text-center font-display text-xl font-extrabold text-primary-darker">
                Área restrita
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Informe a senha para ver o painel de leads.
              </p>

              <label htmlFor="senha" className="mt-6 block text-sm font-medium">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                className="focus-gov mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />

              {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}

              <button
                type="submit"
                disabled={entrando || !senha}
                className="focus-gov mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {entrando ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </div>
        </main>
        <GovFooter />
      </>
    );
  }

  return (
    <>
      <GovHeader />
      <main className="min-h-screen bg-muted/40 pb-16">
        <div className="gov-stripe h-1" aria-hidden />
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-primary-darker">
                Painel de leads
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Todo mundo que preencheu o formulário e gerou um PIX.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void atualizar()}
                disabled={atualizando}
                className="focus-gov inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${atualizando ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Atualizar
              </button>
              <button
                onClick={() => void onSair()}
                className="focus-gov rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sair
              </button>
            </div>
          </div>

          {resumo && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Cartao
                icone={<Users className="size-5 text-primary" aria-hidden />}
                rotulo="Leads"
                valor={String(resumo.leads)}
                nota={`${resumo.leadsHoje} hoje`}
              />
              <Cartao
                icone={<Wallet className="size-5 text-success" aria-hidden />}
                rotulo="Vendas"
                valor={String(resumo.pagos)}
                nota={`${resumo.pagosHoje} hoje`}
              />
              <Cartao
                icone={<TrendingUp className="size-5 text-primary" aria-hidden />}
                rotulo="Conversão"
                valor={`${resumo.conversao.toFixed(1)}%`}
                nota={`${resumo.pendentes} aguardando pagamento`}
              />
              <Cartao
                icone={<Wallet className="size-5 text-success" aria-hidden />}
                rotulo="Receita"
                valor={MOEDA.format(resumo.receita)}
                nota="somente pedidos pagos"
              />
            </div>
          )}

          <Funil etapas={funil} />

          <div className="mt-8 rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou e-mail"
                  className="focus-gov w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm"
                />
              </div>

              <div className="flex rounded-md border border-border p-0.5">
                {(["todos", "pago", "pendente"] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setFiltro(op)}
                    className={`focus-gov rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      filtro === op
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>

              <button
                onClick={exportarCsv}
                disabled={!visiveis.length}
                className="focus-gov inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Download className="size-4" aria-hidden />
                CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{l.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <a
                          href={`mailto:${l.email}`}
                          className="focus-gov hover:text-primary hover:underline"
                        >
                          {l.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                            ESTILO_STATUS[l.status] ?? ESTILO_STATUS.estornado
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatarData(l.criadoEm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!visiveis.length && (
                <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {leads.length
                    ? "Nenhum lead com esses filtros."
                    : "Ainda não há leads. Eles aparecem aqui assim que alguém gera um PIX."}
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Mostrando {visiveis.length} de {leads.length}. Um lead vira “pago” quando o
            gateway confirma o PIX — é nesse momento que o guia é enviado por e-mail.
          </p>
        </div>
      </main>
      <GovFooter />
    </>
  );
}

function Funil({ etapas }: { etapas: EtapaPainel[] }) {
  const topo = etapas[0]?.total ?? 0;

  if (!topo) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="font-display text-lg font-bold text-primary-darker">Funil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ainda não há visitas registradas. As etapas começam a aparecer assim que
          alguém abrir o site.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold text-primary-darker">Funil</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pessoas distintas que chegaram a cada etapa.
      </p>

      <div className="mt-6 space-y-3">
        {etapas.map((etapa, i) => {
          const anterior = i === 0 ? etapa.total : etapas[i - 1].total;
          const largura = topo ? (etapa.total / topo) * 100 : 0;
          const doTopo = topo ? (etapa.total / topo) * 100 : 0;
          const perdaAqui = anterior - etapa.total;
          const pago = etapa.chave === "pago";

          return (
            <div key={etapa.chave}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-foreground">{etapa.rotulo}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <strong className="text-foreground">{etapa.total}</strong>
                  {" · "}
                  {doTopo.toFixed(0)}%
                  {i > 0 && perdaAqui > 0 && (
                    <span className="text-destructive"> · −{perdaAqui}</span>
                  )}
                </span>
              </div>

              <div className="mt-1.5 h-7 w-full overflow-hidden rounded bg-muted">
                <div
                  className={`h-full rounded transition-all ${
                    pago ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${Math.max(largura, etapa.total ? 1.5 : 0)}%` }}
                  role="img"
                  aria-label={`${etapa.rotulo}: ${etapa.total} pessoas, ${doTopo.toFixed(0)}% do topo do funil`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
        A porcentagem é sobre o topo do funil. O número em vermelho é quanta gente se
        perdeu na passagem da etapa anterior para esta — é ali que vale mexer.
      </p>
    </div>
  );
}

function Cartao({
  icone,
  rotulo,
  valor,
  nota,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  nota: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icone}
        {rotulo}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-primary-darker">
        {valor}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{nota}</p>
    </div>
  );
}
