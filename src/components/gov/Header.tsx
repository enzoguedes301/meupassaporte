import { BookMarked, User } from "lucide-react";

export function GovHeader() {
  return (
    <header className="sticky top-0 z-50">
      {/* Aviso de não-vínculo (desktop only) */}
      <div className="hidden bg-amber-50 text-amber-900 px-4 py-2.5 md:flex md:items-center md:justify-start md:gap-2 border-b border-amber-200">
        <span className="text-base">⚠️</span>
        <span className="text-sm font-semibold">Material particular • Sem vínculo com a Polícia Federal ou órgãos públicos</span>
      </div>
      {/* Barra superior institucional */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-4 px-4 text-[11px] font-medium tracking-wide">
          <span className="min-w-0 truncate opacity-90">🛂 Seu guia privado para o passaporte</span>
          <nav aria-label="Atalhos" className="hidden gap-4 sm:flex">
            <a href="#conteudo" className="hover:underline">
              Conteúdo
            </a>
            <a href="#faq" className="hover:underline">
              Dúvidas
            </a>
            <a href="#acesso" className="hover:underline">
              Adquirir guia
            </a>
          </nav>
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
            className="focus-gov inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:px-5"
          >
            <User className="size-4" aria-hidden />
            Solicitar
          </a>
        </div>
      </div>
      <div className="gov-stripe h-1" aria-hidden />
    </header>
  );
}
