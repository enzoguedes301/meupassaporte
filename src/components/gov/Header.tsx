import { useNavigate } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";

/**
 * Leva ao formulário já com o capítulo escolhido. Mesclamos com o que estiver
 * salvo para não apagar dados de quem voltou ao início no meio da compra.
 */
function useIrParaCompra() {
  const navigate = useNavigate();

  return (tipo: string) => {
    try {
      const salvo = sessionStorage.getItem("formulario-checkout");
      const dados = salvo ? (JSON.parse(salvo) as Record<string, unknown>) : {};
      sessionStorage.setItem(
        "formulario-checkout",
        JSON.stringify({ ...dados, tipoSolicitacao: tipo }),
      );
    } catch {
      //
    }
    void navigate({ to: "/checkout-form" });
  };
}

export function GovHeader() {
  const irParaCompra = useIrParaCompra();

  return (
    <header className="sticky top-0 z-50">
      {/*
        Aviso de não-vínculo. Precisa aparecer em TODA largura de tela: é o
        primeiro elemento que um revisor de anúncios vê, e ele revisa no mobile.
      */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900">
        <div className="mx-auto flex max-w-6xl items-start gap-2">
          <span className="mt-0.5 shrink-0 text-sm leading-none" aria-hidden>
            ⚠️
          </span>
          <p className="text-[11px] leading-snug sm:text-xs">
            <strong className="font-bold">
              Site particular. Não somos a Polícia Federal nem o gov.br.
            </strong>{" "}
            Comercializamos um guia informativo em PDF. Todo o processo pode ser
            realizado gratuitamente pelo próprio interessado, nos canais oficiais
            do Governo Federal, mediante o pagamento apenas das taxas oficiais.
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
          <a href="#" className="focus-gov flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
              <BookMarked className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-display text-base font-extrabold text-primary-dark sm:text-lg">
                Guia do Passaporte
              </span>
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                Passo a passo do primeiro documento
              </span>
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => irParaCompra("primeira-via")}
              className="focus-gov inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-none bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:px-5 sm:text-sm"
            >
              Primeira Guia
            </button>

            <button
              type="button"
              onClick={() => irParaCompra("renovacao")}
              className="focus-gov inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-none border border-primary bg-surface px-3.5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft/40 sm:px-5 sm:text-sm"
            >
              Guia de Renovação
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
