import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Fingerprint,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { HeroSolicitacao } from "@/components/gov/HeroSolicitacao";
import { SolicitacaoDialog } from "@/components/gov/SolicitacaoDialog";
import heroImage from "@/assets/hero-passaporte.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Guia do Passaporte — Passo a passo do primeiro passaporte" },
      {
        name: "description",
        content:
          "Guia digital com o passo a passo completo para tirar o primeiro passaporte brasileiro: documentos, taxa, agendamento e atendimento sem erros.",
      },
      {
        property: "og:title",
        content: "Guia do Passaporte — Passo a passo do primeiro passaporte",
      },
      {
        property: "og:description",
        content:
          "Documentos, taxa, agendamento e atendimento explicados em linguagem simples, do início ao documento em mãos.",
      },
      { property: "og:url", content: "https://meupassaporte.digital/" },
      {
        property: "og:image",
        content: "https://meupassaporte.digital/og-guia-passaporte.jpg",
      },
      {
        name: "twitter:image",
        content: "https://meupassaporte.digital/og-guia-passaporte.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://meupassaporte.digital/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Guia do Passaporte",
          description:
            "Guia digital com o passo a passo completo para solicitar o primeiro passaporte brasileiro.",
          image: "https://meupassaporte.digital/produto-guia-passaporte.jpg",
          url: "https://meupassaporte.digital/",
          brand: { "@type": "Brand", name: "Guia do Passaporte" },
          offers: {
            "@type": "Offer",
            url: "https://meupassaporte.digital/",
            price: "239.90",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "BRL",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "BR",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "DAY",
                },
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "BR",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 7,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
          },
        }),
      },
    ],
  }),
});

const etapas = [
  {
    icon: FileText,
    titulo: "1. Reúna os documentos",
    texto:
      "Lista completa e atualizada do que é exigido para maiores e menores de idade, incluindo os casos especiais que mais geram indeferimento.",
  },
  {
    icon: CreditCard,
    titulo: "2. Emita e pague a taxa (GRU)",
    texto:
      "Como gerar a guia oficial, onde pagar, prazo de compensação e o que fazer se o pagamento não constar no sistema.",
  },
  {
    icon: CalendarClock,
    titulo: "3. Faça o agendamento",
    texto:
      "Como preencher o formulário, escolher o posto de atendimento e liberar novas vagas quando a agenda aparece lotada.",
  },
  {
    icon: Fingerprint,
    titulo: "4. Compareça ao atendimento",
    texto:
      "O que levar, como é a coleta de foto, assinatura e digitais, e os erros que fazem o solicitante voltar outro dia.",
  },
  {
    icon: MapPin,
    titulo: "5. Acompanhe e retire",
    texto:
      "Como consultar o andamento, prazos médios de produção e as regras de retirada por terceiros com procuração.",
  },
  {
    icon: BadgeCheck,
    titulo: "6. Depois do passaporte",
    texto:
      "Validade, cuidados com o documento, vistos, exigências de países e o que fazer em caso de perda ou roubo.",
  },
];

const conteudos = [
  "Guia completo em PDF, com 6 módulos em linguagem simples",
  "Checklist imprimível de documentos por perfil",
  "Modelos de autorização para menores de idade",
  "Passo a passo ilustrado do agendamento",
  "Lista de erros que causam indeferimento",
  "Orientação para perda, roubo e segunda via",
  "Perguntas frequentes respondidas em detalhe",
  "Atualizações gratuitas sempre que as regras mudarem",
];

const faq = [
  {
    q: "Em quanto tempo recebo o material?",
    a: "Assim que o pagamento é confirmado (normalmente em poucos minutos), o Guia do Passaporte em PDF é enviado para o e-mail que você informou na compra. O arquivo é seu para sempre, e você pode acessá-lo de qualquer dispositivo.",
  },
  {
    q: "Esse serviço tem vínculo com o governo?",
    a: "Não. Este é um material educacional independente e privado. Não temos qualquer vínculo com a Polícia Federal, com o gov.br ou com órgãos públicos. O agendamento e a emissão do passaporte são feitos exclusivamente nos canais oficiais do Governo Federal.",
  },
  {
    q: "O que exatamente está incluso?",
    a: "O guia completo em PDF com 6 módulos (documentos, taxa e pagamento, agendamento, atendimento, acompanhamento e retirada, e cuidados pós-passaporte), checklist imprimível de documentos, modelos de autorização para menores, passo a passo ilustrado do agendamento online, lista de erros que causam indeferimento, orientações para perda/roubo, respostas a perguntas frequentes e atualizações gratuitas sempre que as regras mudarem.",
  },
  {
    q: "O valor pago aqui é a taxa do passaporte?",
    a: "Não. O valor cobrado (R$ 239,90) é apenas pelo acesso ao guia educacional. A taxa oficial do passaporte é paga separadamente, por meio de guia emitida no sistema do órgão responsável (Polícia Federal).",
  },
  {
    q: "Serve para quem nunca tirou passaporte?",
    a: "Sim, o guia foi escrito exatamente para o primeiro passaporte, do zero, sem pressupor conhecimento prévio sobre o processo. Todas as terminologias técnicas são explicadas na hora.",
  },
  {
    q: "E se eu precisar tirar o passaporte de uma criança?",
    a: "Há um módulo específico para menores de idade, com documentação, autorizações, casos de guarda e situações em que apenas um dos responsáveis pode comparecer.",
  },
  {
    q: "Como recebo atualizações do guia?",
    a: "Sempre que as regras ou procedimentos mudarem, enviamos a nova versão para o mesmo e-mail da compra, sem custo adicional. Você tem acesso a todas as atualizações futuras, garantindo que o guia está sempre atualizado.",
  },
  {
    q: "Posso pedir reembolso?",
    a: "Sim. Se o guia não atender às suas expectativas, você pode solicitar o reembolso integral dentro do prazo de garantia de 7 dias contado a partir da data da compra.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <GovHeader />

      <main>
        {/* HERO */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-[1.15] text-primary-darker sm:text-4xl lg:text-5xl">
                Tire seu primeiro passaporte sem erro, sem fila extra e sem retrabalho
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Um passo a passo direto, em linguagem simples, que acompanha você desde a separação
                dos documentos até o documento na mão — com os detalhes que mais fazem gente perder
                o atendimento.
              </p>

              <HeroSolicitacao />

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-6 sm:gap-4">
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">Módulos</dt>
                  <dd className="font-display text-xl font-extrabold text-primary-dark sm:text-2xl">
                    6
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">Formato</dt>
                  <dd className="font-display text-xl font-extrabold text-primary-dark sm:text-2xl">
                    PDF
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">Garantia</dt>
                  <dd className="font-display text-xl font-extrabold text-primary-dark sm:text-2xl">
                    7 dias
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div
                className="absolute inset-6 rounded-full bg-primary-soft/70 blur-2xl"
                aria-hidden
              />
              <img
                src={heroImage}
                alt="Ilustração de um passaporte brasileiro ao lado de um checklist de documentos e um celular com o formulário de solicitação"
                width={1024}
                height={1024}
                className="relative mx-auto w-full max-w-md"
              />
            </div>
          </div>
        </section>

        {/* ETAPAS */}
        <section id="etapas" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <header className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Como funciona o processo
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-primary-darker sm:text-4xl">
              As 6 etapas do primeiro passaporte
            </h2>
            <p className="mt-3 text-muted-foreground">
              Cada etapa do guia traz o que fazer, o que evitar e o que ter em mãos antes de
              avançar.
            </p>
          </header>

          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {etapas.map((etapa) => (
              <li
                key={etapa.titulo}
                className="group rounded-md border border-border border-l-4 border-l-primary bg-surface p-6 transition-shadow hover:shadow-gov"
              >
                <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-dark">
                  <etapa.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-primary-darker">
                  {etapa.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{etapa.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CONTEÚDO */}
        <section id="conteudo" className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">
                O que está incluído
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-primary-darker sm:text-4xl">
                Tudo o que você recebe ao adquirir o acesso
              </h2>
              <p className="mt-3 text-muted-foreground">
                Material objetivo, revisado e organizado para ser consultado no celular enquanto
                você resolve cada etapa.
              </p>

              <ul className="mt-8 space-y-3">
                {conteudos.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:content-start">
              {[
                {
                  icon: ShieldCheck,
                  t: "Informação conferida",
                  d: "Conteúdo revisado com base nas orientações oficiais vigentes e atualizado quando as regras mudam.",
                },
                {
                  icon: Users,
                  t: "Adultos e menores",
                  d: "Trilhas separadas para quem tira o próprio passaporte e para responsáveis por crianças e adolescentes.",
                },
                {
                  icon: Info,
                  t: "Linguagem simples",
                  d: "Sem juridiquês: cada termo técnico é explicado na hora em que aparece.",
                },
                {
                  icon: Lock,
                  t: "Entrega por e-mail",
                  d: "Após a confirmação do pagamento, o guia em PDF chega no seu e-mail para ler no celular ou imprimir.",
                },
              ].map((c) => (
                <div key={c.t} className="rounded-md border border-border bg-background p-6">
                  <c.icon className="size-6 text-primary" aria-hidden />
                  <h3 className="mt-3 font-display text-base font-bold text-primary-darker">
                    {c.t}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACESSO / PREÇO */}
        <section id="acesso" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-gov-lg">
            <div className="gov-stripe h-1.5" aria-hidden />
            <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">
                  Como adquirir
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-primary-darker sm:text-4xl">
                  Pagamento único, enviado por e-mail
                </h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  Um valor único pelo guia completo em PDF, entregue no seu e-mail, com todas as
                  atualizações futuras incluídas. A taxa oficial do passaporte não está inclusa e é
                  paga diretamente ao órgão responsável.
                </p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    "Entrega no seu e-mail após a confirmação",
                    "Atualizações enviadas por e-mail",
                    "Checklists imprimíveis inclusos",
                    "Garantia de 7 dias",
                  ].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center rounded-md border-2 border-primary bg-primary-soft/40 p-6 text-center sm:p-8">
                <p className="text-sm font-medium text-primary-dark">
                  Clique abaixo para garantir o seu acesso
                </p>

                <SolicitacaoDialog>
                  <button
                    type="button"
                    className="focus-gov mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    Adquirir agora
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </SolicitacaoDialog>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden />
                  Ambiente de pagamento seguro
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16 lg:py-20">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Dúvidas</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-primary-darker sm:text-4xl">
              Perguntas frequentes
            </h2>

            <div className="mt-8 divide-y divide-border border-y border-border">
              {faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="focus-gov flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-primary-darker">
                    {item.q}
                    <span
                      className="shrink-0 text-primary transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <GovFooter />
    </div>
  );
}
