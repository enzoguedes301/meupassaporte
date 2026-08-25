import { Link } from "@tanstack/react-router";

export function GovFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="h-1 bg-gradient-to-r from-primary via-primary-dark to-primary-dark/70" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-display text-xl font-extrabold">Guia do Passaporte</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed opacity-80">
            Material informativo independente que organiza, em linguagem simples, o passo a passo
            para solicitar o primeiro passaporte brasileiro.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Navegação</p>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>
              <a className="hover:underline" href="#conteudo">
                O que você recebe
              </a>
            </li>
            <li>
              <a className="hover:underline" href="#etapas">
                Etapas do processo
              </a>
            </li>
            <li>
              <a className="hover:underline" href="#acesso">
                Adquirir agora
              </a>
            </li>
            <li>
              <a className="hover:underline" href="#faq">
                Perguntas frequentes
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Transparência</p>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>
              <Link to="/termos-de-uso" className="hover:underline">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link to="/politica-de-privacidade" className="hover:underline">
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos-de-uso" className="hover:underline">
                Política de reembolso
              </Link>
            </li>
            <li>Suporte ao comprador</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed opacity-70">
          <strong className="font-semibold">Aviso importante:</strong> este site é um produto
          educacional privado e não possui vínculo, patrocínio ou representação de qualquer órgão
          público, da Polícia Federal ou do portal gov.br. A emissão do passaporte é feita
          exclusivamente pelos canais oficiais do Governo Federal, e as taxas oficiais são pagas
          diretamente ao órgão competente.
        </div>
      </div>
    </footer>
  );
}
