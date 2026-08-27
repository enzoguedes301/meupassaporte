import { Link } from "@tanstack/react-router";

import { EMPRESA, TAXA_GRU_COMUM, URL_GRU_OFICIAL, brl } from "@/lib/guia.constants";

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
            <li>
              <a className="hover:underline" href={`mailto:${EMPRESA.email}`}>
                Falar com o suporte
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/*
        Identificação do vendedor. As políticas de anúncio exigem saber quem
        está por trás do site — sem isso a campanha cai por "identidade
        empresarial indisponível".
      */}
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed opacity-80">
          <p className="font-semibold uppercase tracking-wide">Quem vende este guia</p>
          <address className="mt-2 not-italic">
            {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}
            <br />
            {EMPRESA.endereco}
            <br />
            <a className="underline" href={`mailto:${EMPRESA.email}`}>
              {EMPRESA.email}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed opacity-70">
          <p>
            <strong className="font-semibold">Aviso importante:</strong> este site é um produto
            informativo privado e opcional. Não somos a Polícia Federal, não somos o gov.br e não
            temos vínculo, patrocínio ou representação de qualquer órgão público. Não emitimos
            passaporte nem agendamos atendimento.
          </p>
          <p className="mt-3">
            <strong className="font-semibold">
              Todo o processo pode ser feito por você, de graça, nos canais oficiais do governo
            </strong>
            , pagando apenas as taxas oficiais. O que você paga aqui é apenas pelo guia em PDF. A
            taxa do passaporte (GRU, {brl(TAXA_GRU_COMUM)} na modalidade comum) é paga
            separadamente e diretamente à Polícia Federal, pelo{" "}
            <a
              className="underline"
              href={URL_GRU_OFICIAL}
              target="_blank"
              rel="noopener noreferrer"
            >
              site oficial
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
