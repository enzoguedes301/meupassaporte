import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { TipoSolicitacaoSelect } from "@/components/gov/TipoSolicitacaoSelect";
import { cn } from "@/lib/utils";

export function HeroSolicitacao() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [erro, setErro] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  function comecar() {
    if (!tipo) {
      setErro(true);
      setTentativas((n) => n + 1);
      return;
    }
    setErro(false);
    // Salvar o tipo selecionado no sessionStorage e navegar para o formulário
    sessionStorage.setItem("tipo-selecionado", tipo);
    void navigate({ to: "/checkout-form" });
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <TipoSolicitacaoSelect
          key={tentativas}
          value={tipo}
          onChange={(novo) => {
            setTipo(novo);
            setErro(false);
          }}
          invalido={erro}
          className={cn(
            "w-full min-w-0 flex-1 sm:min-w-[280px] sm:max-w-[380px]",
            erro && "gov-shake",
          )}
        />

        <button
          type="button"
          onClick={comecar}
          className="focus-gov inline-flex h-14 w-full items-center justify-center gap-2 rounded-none bg-primary px-7 text-base font-semibold text-primary-foreground shadow-gov transition-colors hover:bg-primary-dark sm:w-auto"
        >
          Começar agora
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-2.5 text-sm font-medium text-destructive">
          Selecione o tipo de solicitação para continuar.
        </p>
      )}

      <a
        href="#etapas"
        className="focus-gov mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Ver as etapas do processo
        <ArrowRight className="size-3.5" aria-hidden />
      </a>
    </div>
  );
}
