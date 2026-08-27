import { ArrowRight } from "lucide-react";

import { useIrParaCompra } from "@/lib/compra";
import { URL_GRU_OFICIAL } from "@/lib/guia.constants";

/**
 * Chamada de compra do hero.
 *
 * Aqui não existe seleção de "tipo de solicitação": uma caixa com Primeira Via
 * / Renovação / Emergencial reproduz a taxonomia do requerimento da Polícia
 * Federal e faz a página parecer um canal de solicitação de passaporte. O que
 * vendemos é um PDF, então os botões nomeiam versões do guia e levam direto à
 * compra.
 */
export function HeroSolicitacao() {
  const irParaCompra = useIrParaCompra();

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => irParaCompra("primeira-via")}
          className="focus-gov inline-flex h-14 items-center justify-center gap-2 rounded-none bg-primary px-7 text-base font-semibold text-primary-foreground shadow-gov transition-colors hover:bg-primary-dark"
        >
          Primeira Guia
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => irParaCompra("renovacao")}
          className="focus-gov inline-flex h-14 items-center justify-center gap-2 rounded-none border border-primary bg-surface px-7 text-base font-semibold text-primary transition-colors hover:bg-primary-soft/40"
        >
          Guia de Renovação
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>

      <a
        href="#conteudo"
        className="focus-gov mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Ver o que vem no guia
        <ArrowRight className="size-3.5" aria-hidden />
      </a>

      <p className="mt-5 max-w-xl border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
        O pagamento efetuado neste site refere-se{" "}
        <strong className="font-semibold text-foreground">exclusivamente ao guia em PDF</strong> e
        não tem relação com a taxa do passaporte. A taxa oficial (GRU) é recolhida por você{" "}
        <a
          className="gov-link"
          href={URL_GRU_OFICIAL}
          target="_blank"
          rel="noopener noreferrer"
        >
          diretamente à Polícia Federal
        </a>
        , em valor definido pelo órgão. Todo o processo pode ser realizado gratuitamente nos canais
        oficiais do Governo Federal; a aquisição do guia é opcional e destina-se a reduzir o tempo
        dedicado ao procedimento e a evitar erros de preenchimento.
      </p>
    </div>
  );
}
