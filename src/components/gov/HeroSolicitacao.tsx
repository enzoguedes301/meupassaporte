import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { URL_GRU_OFICIAL } from "@/lib/guia.constants";

/**
 * Chamada de compra do hero.
 *
 * Aqui não existe seleção de "tipo de solicitação": uma caixa com Primeira Via
 * / Renovação / Emergencial reproduz a taxonomia do requerimento da Polícia
 * Federal e faz a página parecer um canal de solicitação de passaporte. O que
 * vendemos é um PDF, então o hero leva direto para a compra.
 */
export function HeroSolicitacao() {
  const navigate = useNavigate();

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void navigate({ to: "/checkout-form" })}
          className="focus-gov inline-flex h-14 items-center justify-center gap-2 rounded-none bg-primary px-7 text-base font-semibold text-primary-foreground shadow-gov transition-colors hover:bg-primary-dark"
        >
          Quero o guia
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <a
          href="#conteudo"
          className="focus-gov inline-flex h-14 items-center justify-center rounded-none border border-border bg-background px-6 text-base font-semibold text-primary transition-colors hover:bg-muted"
        >
          Ver o que vem no guia
        </a>
      </div>

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
