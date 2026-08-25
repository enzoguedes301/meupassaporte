import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Mail, Package } from "lucide-react";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { consultarPagamento } from "@/lib/pagamentos.functions";
import { dispararConversaoCompra } from "@/lib/gtag";

export const Route = createFileRoute("/checkout/retorno")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: Retorno,
  head: () => ({
    meta: [
      { title: "Pedido confirmado — Guia do Passaporte" },
      {
        name: "description",
        content:
          "Confirmação do pedido do Guia do Passaporte. O PDF é enviado para o e-mail informado.",
      },
      { property: "og:title", content: "Pedido confirmado — Guia do Passaporte" },
      {
        property: "og:description",
        content: "Seu pedido do Guia do Passaporte foi registrado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type DadosPedido = {
  nome?: string;
  email?: string;
  tipoSolicitacao?: string;
  [key: string]: unknown;
};

function Retorno() {
  const { session_id: sessionId } = Route.useSearch();
  const consultar = useServerFn(consultarPagamento);
  const [dadosPedido, setDadosPedido] = useState<DadosPedido>({});

  const isPedidoId =
    !!sessionId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);

  const { data } = useQuery({
    queryKey: ["pagamento", sessionId],
    enabled: isPedidoId,
    queryFn: () => consultar({ data: { pedidoId: sessionId! } }),
    refetchInterval: (query) => (query.state.data?.status === "pago" ? false : 5000),
  });

  // Recuperar dados do sessionStorage
  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("solicitacao-guia");
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos) as DadosPedido;
        setDadosPedido(dados);
      } catch {
        // ignorar erro de parse
      }
    }
  }, []);

  useEffect(() => {
    if (data?.status === "pago" && data.transactionId) {
      dispararConversaoCompra(data.transactionId);
    }
  }, [data]);


  return (
    <>
      <GovHeader />
      <main className="min-h-screen bg-muted/40 pb-16">
        <div className="gov-stripe h-1" aria-hidden />
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
          {sessionId ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
                <h1 className="mt-4 font-display text-2xl font-extrabold text-primary-darker">
                  Pagamento recebido
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Seu pedido foi registrado com sucesso. O Guia do Passaporte em PDF
                  será enviado para o e-mail informado assim que o pagamento for
                  confirmado pela operadora — normalmente em poucos minutos.
                </p>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-4" aria-hidden />
                  Verifique também a caixa de spam ou promoções.
                </p>
              </div>

              {/* Resumo do pedido */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="size-5 text-primary" aria-hidden />
                  <h2 className="font-display text-lg font-bold text-primary-darker">
                    Resumo do pedido
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="pb-4 border-b border-border">
                    <dt className="text-sm font-medium text-muted-foreground">Número do pedido</dt>
                    <dd className="mt-1 font-mono text-sm text-primary-darker break-all">
                      {sessionId}
                    </dd>
                  </div>

                  {dadosPedido.nome && (
                    <div className="pb-4 border-b border-border">
                      <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                      <dd className="mt-1 text-sm text-foreground">{dadosPedido.nome}</dd>
                    </div>
                  )}

                  {dadosPedido.email && (
                    <div className="pb-4 border-b border-border">
                      <dt className="text-sm font-medium text-muted-foreground">E-mail</dt>
                      <dd className="mt-1 text-sm text-foreground break-all">{dadosPedido.email}</dd>
                    </div>
                  )}

                  {dadosPedido.tipoSolicitacao && (
                    <div className="pb-4 border-b border-border">
                      <dt className="text-sm font-medium text-muted-foreground">Tipo de solicitação</dt>
                      <dd className="mt-1 text-sm text-foreground">{dadosPedido.tipoSolicitacao}</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Valor</dt>
                    <dd className="mt-1 text-lg font-bold text-primary-darker">R$ 239,90</dd>
                  </div>
                </div>

                <p className="mt-6 text-xs text-muted-foreground border-t border-border pt-6">
                  O acesso ao Guia do Passaporte é vitalício. Você receberá todas as atualizações
                  futuras no mesmo e-mail da compra, sem custo adicional.
                </p>
              </div>

              <Link
                to="/"
                className="focus-gov block text-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Voltar ao início
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h1 className="font-display text-2xl font-extrabold text-primary-darker">
                Pedido não localizado
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Não encontramos informações desta sessão de pagamento.
              </p>
              <Link
                to="/"
                className="focus-gov mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Voltar ao início
              </Link>
            </div>
          )}
        </div>
      </main>
      <GovFooter />
    </>
  );
}
