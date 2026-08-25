import { createFileRoute, Link } from "@tanstack/react-router";
import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";

export const Route = createFileRoute("/termos-de-uso")({
  component: TermosDeUso,
  head: () => ({
    meta: [
      { title: "Termos de Uso — Guia do Passaporte" },
      {
        name: "description",
        content:
          "Termos e condições de uso e compra do Guia do Passaporte.",
      },
      {
        property: "og:title",
        content: "Termos de Uso — Guia do Passaporte",
      },
      {
        property: "og:description",
        content:
          "Termos e condições de uso e compra do Guia do Passaporte.",
      },
      {
        property: "og:url",
        content: "https://meu-passaporte-facil.lovable.app/termos-de-uso",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://meu-passaporte-facil.lovable.app/termos-de-uso",
      },
    ],
  }),
});

function TermosDeUso() {
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
            <span className="text-foreground">Termos de Uso</span>
          </nav>

          <h1 className="font-display text-3xl font-extrabold text-primary-dark sm:text-4xl">
            Termos de Uso
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Esta página é mantida pelo responsável pelo Guia do Passaporte para regular o uso
            do site e a aquisição do material digital.
          </p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                1. Sobre o produto
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O Guia do Passaporte é um material educacional digital, vendido em formato PDF,
                que organiza o passo a passo para solicitar o primeiro passaporte brasileiro.
                O produto não substitui o atendimento oficial, não agenda passaporte em nome do
                cliente e não possui vínculo com órgãos públicos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                2. Independência de órgãos públicos
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Este site é um produto educacional privado e não possui vínculo, patrocínio ou
                representação de qualquer órgão público, da Polícia Federal ou do portal
                gov.br. A emissão do passaporte é feita exclusivamente pelos canais oficiais do
                Governo Federal, e as taxas oficiais são pagas diretamente ao órgão competente.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                3. Aquisição e entrega
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O valor atual do guia é de <strong>R$ 239,90</strong> (duzentos e trinta e nove
                reais e noventa centavos), podendo ser alterado a qualquer momento sem aviso
                prévio. Após a confirmação do pagamento, o arquivo PDF é enviado para o e-mail
                informado no momento da compra.
              </p>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O prazo de entrega é em até 24 horas úteis após a confirmação do pagamento,
                exceto em casos de instabilidade técnica ou dados incorretos fornecidos pelo
                comprador.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                4. Pagamento
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Os pagamentos são processados por gateway de pagamento contratado, em ambiente seguro de pagamentos online.
                O comprador é responsável por fornecer dados verdadeiros, completos e atualizados.
                Em caso de suspeita de fraude, a compra pode ser cancelada.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                5. Política de reembolso
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Oferecemos garantia de reembolso de 7 dias corridos a partir da confirmação do
                pagamento, desde que o arquivo PDF não tenha sido baixado ou acessado. Para
                solicitar o reembolso, o comprador deve enviar uma mensagem para o canal de
                suporte indicado na página de confirmação de compra, informando o e-mail usado
                na compra e o motivo do pedido.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                6. Uso permitido
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O guia adquirido é de uso pessoal e intransferível. É proibida a reprodução,
                distribuição, revenda, compartilhamento em redes públicas ou qualquer outra forma
                de exploração comercial do conteúdo, total ou parcial, sem autorização prévia e
                por escrito.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                7. Responsabilidades
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Fazemos o possível para manter as informações do guia atualizadas e claras. No
                entanto, regras e procedimentos oficiais podem mudar sem aviso prévio. O usuário
                deve sempre confirmar as informações nos canais oficiais do governo antes de
                tomar decisões.
              </p>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Não nos responsabilizamos por indeferimentos, atrasos, custos adicionais ou
                perdas resultantes de informações desatualizadas fornecidas por órgãos oficiais
                ou de erro na prestação de dados pelo solicitante.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                8. Suporte ao comprador
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                O suporte é oferecido por e-mail, em dias úteis, para esclarecer dúvidas sobre o
                conteúdo do guia, problemas no recebimento do arquivo e solicitações de
                reembolso dentro do prazo. O canal de contato é disponibilizado na página de
                confirmação de compra.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                9. Alterações nos termos
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Estes termos podem ser atualizados a qualquer momento. Ao realizar uma nova
                compra, você concorda com a versão vigente no momento da aquisição.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary-dark">
                10. Lei aplicável
              </h2>
              <p className="mt-3 text-foreground/90 leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                Em caso de conflito, as partes elegem o foro da comarca do domicílio do
                consumidor para dirimir quaisquer questões.
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
