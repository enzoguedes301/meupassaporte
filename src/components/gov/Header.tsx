import { BookMarked, User } from "lucide-react";

export function GovHeader() {
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
            Vendemos um guia informativo em PDF — você mesmo pode fazer todo o
            processo de graça nos canais oficiais do governo, pagando apenas as
            taxas oficiais.
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-2">
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

          <a
            href="#acesso"
            className="focus-gov inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:px-5"
          >
            <User className="size-4" aria-hidden />
            Comprar guia
          </a>
        </div>
      </div>
    </header>
  );
}
