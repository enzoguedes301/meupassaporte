import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Stamp } from "lucide-react";

import { TIPOS_SOLICITACAO } from "@/lib/solicitacao";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalido?: boolean;
  className?: string;
};

export function TipoSolicitacaoSelect({ value, onChange, invalido = false, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const itensRef = useRef<(HTMLLIElement | null)[]>([]);
  const menuId = useId();

  const selecionado = TIPOS_SOLICITACAO.find((tipo) => tipo.value === value);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setAberto(false);
    }

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const indice = TIPOS_SOLICITACAO.findIndex((tipo) => tipo.value === value);
    itensRef.current[indice < 0 ? 0 : indice]?.focus();
  }, [aberto, value]);

  function selecionar(novo: string) {
    onChange(novo);
    setAberto(false);
    toggleRef.current?.focus();
  }

  function moverFoco(indice: number, passo: number) {
    const total = TIPOS_SOLICITACAO.length;
    itensRef.current[(indice + passo + total) % total]?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={toggleRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={aberto ? menuId : undefined}
        aria-invalid={invalido || undefined}
        onClick={() => setAberto((atual) => !atual)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setAberto(true);
          }
        }}
        className={cn(
          "focus-gov relative flex h-14 w-full items-center gap-2.5 rounded-md border bg-background py-0 pl-4 pr-11 text-left text-sm transition-colors",
          invalido
            ? "border-destructive"
            : aberto
              ? "border-primary"
              : "border-border hover:border-primary/60",
          selecionado ? "font-semibold text-primary-darker" : "text-muted-foreground",
        )}
      >
        <Stamp className="size-5 shrink-0 text-primary" aria-hidden />
        <span className="flex-1 truncate">
          {selecionado?.label ?? "Selecione o tipo de solicitação de guia"}
        </span>
        <ChevronDown
          className={cn(
            "absolute right-4 size-4 text-muted-foreground transition-transform",
            aberto && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {aberto && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Tipo de solicitação"
          className="animate-in fade-in-0 slide-in-from-top-1 absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 rounded-md border border-border bg-popover p-1.5 shadow-gov-lg duration-150"
        >
          {TIPOS_SOLICITACAO.map((tipo, indice) => {
            const ativo = tipo.value === value;
            const Icone = tipo.icon;

            return (
              <li
                key={tipo.value}
                ref={(el) => {
                  itensRef.current[indice] = el;
                }}
                role="option"
                aria-selected={ativo}
                tabIndex={-1}
                onClick={() => selecionar(tipo.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selecionar(tipo.value);
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moverFoco(indice, 1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moverFoco(indice, -1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    itensRef.current[0]?.focus();
                  } else if (event.key === "End") {
                    event.preventDefault();
                    itensRef.current[TIPOS_SOLICITACAO.length - 1]?.focus();
                  } else if (event.key === "Tab") {
                    setAberto(false);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "text-primary-darker hover:bg-primary-soft/60 focus:bg-primary-soft/60",
                )}
              >
                <Icone
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    ativo ? "text-primary-foreground" : "text-primary",
                  )}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className="block font-semibold">{tipo.label}</span>
                  <span
                    className={cn(
                      "block text-xs leading-snug",
                      ativo ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {tipo.descricao}
                  </span>
                </span>
                {ativo && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
