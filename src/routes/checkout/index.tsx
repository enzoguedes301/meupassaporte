import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, QrCode, ShieldCheck, Clock, CheckCircle2, Share2 } from "lucide-react";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { criarPagamentoPix, consultarPagamento } from "@/lib/pagamentos.functions";

export const Route = createFileRoute("/checkout/")({
  ssr: false,
  component: Checkout,
  head: () => ({
    meta: [
      { title: "Pagamento — Guia do Passaporte" },
      {
        name: "description",
        content:
          "Finalize o pagamento via PIX e receba o Guia do Passaporte em PDF no seu e-mail.",
      },
      { property: "og:title", content: "Pagamento — Guia do Passaporte" },
      {
        property: "og:description",
        content: "Finalize o pagamento seguro via PIX e receba o guia em PDF por e-mail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Estado =
  | { fase: "carregando" }
  | { fase: "sem-dados" }
  | { fase: "erro"; mensagem: string }
  | { fase: "pix"; pedidoId: string; pixCode: string; pixImage: string; expiraEm: number };

function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${minutos}:${segs.toString().padStart(2, "0")}`;
}

function Checkout() {
  const navigate = useNavigate();
  const criar = useServerFn(criarPagamentoPix);
  const consultar = useServerFn(consultarPagamento);
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(30 * 60); // 30 minutos em segundos
  const [qrCodeVisivel, setQrCodeVisivel] = useState(true);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    const bruto = sessionStorage.getItem("solicitacao-guia");
    if (!bruto) {
      setEstado({ fase: "sem-dados" });
      return;
    }

    void (async () => {
      try {
        const dados = JSON.parse(bruto) as Record<string, string>;
        const resposta = await criar({ data: dados });
        const agora = Date.now();
        const expiraEm = agora + 30 * 60 * 1000; // 30 minutos a partir de agora
        setEstado({
          fase: "pix",
          pedidoId: resposta.pedidoId,
          pixCode: resposta.pixCode,
          pixImage: resposta.pixImage,
          expiraEm,
        });
        setTempoRestante(30 * 60);
      } catch (err) {
        console.error(err);
        setEstado({
          fase: "erro",
          mensagem:
            "Não foi possível gerar a cobrança PIX agora. Tente novamente em instantes.",
        });
      }
    })();
  }, [criar]);

  // Countdown timer
  useEffect(() => {
    if (estado.fase !== "pix") return;

    const intervalo = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 0) {
          clearInterval(intervalo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estado.fase]);

  // Polling para verificar pagamento
  useEffect(() => {
    if (estado.fase !== "pix") return;
    const pedidoId = estado.pedidoId;

    const intervalo = setInterval(() => {
      void (async () => {
        try {
          const resultado = await consultar({ data: { pedidoId } });
          if (resultado.status === "pago") {
            clearInterval(intervalo);
            sessionStorage.removeItem("solicitacao-guia");
            void navigate({ to: "/checkout/retorno", search: { session_id: pedidoId } });
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [estado, consultar, navigate]);

  async function verificarAgora() {
    if (estado.fase !== "pix") return;
    try {
      const resultado = await consultar({ data: { pedidoId: estado.pedidoId } });
      if (resultado.status === "pago") {
        sessionStorage.removeItem("solicitacao-guia");
        void navigate({ to: "/checkout/retorno", search: { session_id: estado.pedidoId } });
      } else {
        alert("Pagamento ainda não confirmado. Tente novamente em alguns instantes.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao verificar pagamento. Tente novamente.");
    }
  }

  async function copiar(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <>
      <GovHeader />
      <main className="min-h-screen bg-muted/40 pb-16">
        <div className="gov-stripe h-1" aria-hidden />
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:underline">
              Início
            </Link>
            <span className="px-2">/</span>
            <span>Pagamento</span>
          </nav>

          <h1 className="font-display text-2xl font-extrabold text-primary-darker sm:text-3xl">
            Finalizar pagamento
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pagamento único de R$ 239,90 via PIX. Após a confirmação, o guia em PDF é
            enviado para o e-mail informado.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            {estado.fase === "carregando" && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">Gerando sua cobrança PIX…</p>
              </div>
            )}

            {estado.fase === "sem-dados" && (
              <div className="text-center">
                <p className="font-semibold text-primary-darker">
                  Preencha seus dados para continuar
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Volte à página inicial e clique em “Adquirir agora” para informar seus
                  dados.
                </p>
                <Link
                  to="/"
                  className="focus-gov mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                >
                  Voltar ao início
                </Link>
              </div>
            )}

            {estado.fase === "erro" && (
              <div className="text-center">
                <p className="font-semibold text-primary-darker">
                  Não foi possível gerar o PIX
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{estado.mensagem}</p>
              </div>
            )}

            {estado.fase === "pix" && (
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Contador regressivo */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200">
                  <Clock className="size-4 text-amber-600" aria-hidden />
                  <span className="text-sm font-semibold text-amber-900">
                    Válido por: {formatarTempo(tempoRestante)}
                  </span>
                </div>

                <div>
                  <p className="flex items-center justify-center gap-2 font-semibold text-primary-darker">
                    <QrCode className="size-5" aria-hidden />
                    Pague com PIX
                  </p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Escaneie o QR Code no aplicativo do seu banco ou use o código copia e
                    cola. A confirmação é automática.
                  </p>
                </div>

                {qrCodeVisivel && estado.pixImage && (
                  <img
                    src={estado.pixImage}
                    alt="QR Code do PIX para pagamento do Guia do Passaporte"
                    className="mt-6 size-56 rounded-md border border-border bg-background p-2"
                    loading="lazy"
                  />
                )}

                {estado.pixCode && (
                  <>
                    <p className="w-full break-all rounded-md border border-border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
                      {estado.pixCode}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copiar(estado.pixCode)}
                      className="focus-gov inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                    >
                      {copiado ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Copy className="size-4" aria-hidden />
                      )}
                      {copiado ? "Código copiado" : "Copiar código PIX"}
                    </button>
                  </>
                )}

                {/* Botão para verificar pagamento */}
                <button
                  type="button"
                  onClick={() => void verificarAgora()}
                  className="focus-gov inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  Já paguei, verificar agora
                </button>

                {/* Toggle para mostrar/esconder QR Code em outro dispositivo */}
                <button
                  type="button"
                  onClick={() => setQrCodeVisivel(!qrCodeVisivel)}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                >
                  <Share2 className="size-3.5" aria-hidden />
                  {qrCodeVisivel ? "Esconder" : "Mostrar"} QR Code para outro aparelho
                </button>

                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Aguardando confirmação do pagamento…
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" aria-hidden />
            Pagamento processado em ambiente criptografado.
          </p>
        </div>
      </main>
      <GovFooter />
    </>
  );
}
