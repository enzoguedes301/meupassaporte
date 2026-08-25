import { createFileRoute, Link } from "@tanstack/react-router";
import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: PoliticaPrivacidade,
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Guia do Passaporte" },
      {
        name: "description",
        content:
          "Entenda como o Guia do Passaporte coleta, usa e protege seus dados pessoais.",
      },
      {
        property: "og:title",
        content: "Política de Privacidade — Guia do Passaporte",
      },
      {
        property: "og:description",
        content:
          "Entenda como o Guia do Passaporte coleta, usa e protege seus dados pessoais.",
      },
      {
        property: "og:url",
        content: "https://meu-passaporte-facil.lovable.app/politica-de-privacidade",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://meu-passaporte-facil.lovable.app/politica-de-privacidade",
      },
    ],
  }),
});

function PoliticaPrivacidade() {
  return (
    <>
      <GovHeader />
      <main className="min-h-screen bg-background pb-16">
        <div className="gov-stripe h-1" aria-hidden />

        <div className="mx-auto max-w-3xl px-4 py-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:underline">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Política de Privacidade</span>
          </nav>

          <h1 className="font-display text-3xl font-extrabold text-primary-dark sm:text-4xl">
            Política de Privacidade
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Esta página é mantida pelo responsável pelo Guia do Passaporte para esclarecer
            como dados pessoais são tratados no site.
          </p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                1. Dados que coletamos
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Quando você decide adquirir o guia, solicitamos os seguintes dados:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/90 leading-relaxed">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>CPF</li>
                <li>Data de nascimento</li>
              </ul>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Esses dados são necessários para processar o pagamento, gerar o comprovante de
                compra e enviar o guia em PDF para o e-mail informado.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                2. Como usamos seus dados
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/90 leading-relaxed">
                <li>Processar o pagamento via gateway de pagamento contratado</li>
                <li>Enviar o guia em PDF por e-mail após a confirmação do pagamento</li>
                <li>Entrar em contato em caso de dúvidas sobre o pedido</li>
                <li>Cumprir obrigações legais e fiscais</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                3. Armazenamento e proteção
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                As informações são armazenadas em ambiente seguro, com acesso restrito e
                protegido por criptografia em trânsito. O processamento de pagamentos é feito
                pelo gateway de pagamento contratado, que segue padrões de segurança da indústria de cartões (PCI DSS).
                Nós não armazenamos dados completos de cartão de crédito.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                4. Compartilhamento de dados
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Não vendemos, alugamos ou transferimos seus dados pessoais a terceiros para
                fins de marketing. Compartilhamos dados apenas com:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/90 leading-relaxed">
                <li>
                  <strong>Gateway de pagamento:</strong> processamento de pagamentos.
                </li>
                <li>
                  <strong>Provedor de e-mail:</strong> entrega do guia em PDF e comunicações
                  relacionadas ao pedido.
                </li>
                <li>
                  <strong>Autoridades competentes:</strong> quando houver exigência legal.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                5. Cookies e tecnologias semelhantes
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O site pode usar cookies essenciais para o funcionamento da plataforma e de
                segurança. Não utilizamos cookies de rastreamento comportamental ou
                publicidade personalizada sem o seu consentimento.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                6. Seus direitos
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus
                dados pessoais a qualquer momento. Para isso, envie um e-mail para o canal de
                suporte indicado na página de confirmação de compra ou na seção de suporte.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                7. Retenção
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas
                nesta política e para atender a obrigações legais e fiscais. Após esse período,
                os dados são anonimizados ou excluídos de forma segura.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                8. Alterações nesta política
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Esta política pode ser atualizada periodicamente. Recomendamos que você a
                consulte antes de realizar uma nova compra. A data da última atualização será
                sempre indicada ao final desta página.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                9. Contato
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos
                seus dados, entre em contato pelo e-mail de suporte indicado na página de
                confirmação de compra.
              </p>
            </section>
          </div>

          <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
            Última atualização: 29 de julho de 2026.
          </p>
        </div>
      </main>
      <GovFooter />
    </>
  );
}
