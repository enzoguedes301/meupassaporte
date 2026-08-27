import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { VALOR_GUIA, TAXA_GRU_COMUM, URL_GRU_OFICIAL, brl } from "@/lib/guia.constants";

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
          Comprar o guia — {brl(VALOR_GUIA)}
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
        Este valor é <strong className="font-semibold text-foreground">só do guia em PDF</strong> e
        não tem relação com a taxa do passaporte. A taxa oficial (GRU) de{" "}
        {brl(TAXA_GRU_COMUM)} é paga por você{" "}
        <a
          className="gov-link"
          href={URL_GRU_OFICIAL}
          target="_blank"
          rel="noopener noreferrer"
        >
          diretamente à Polícia Federal
        </a>
        . Todo o processo pode ser feito por você, de graça, nos canais do governo — o guia é
        opcional e serve só para te poupar tempo e erro.
      </p>
    </div>
  );
}
