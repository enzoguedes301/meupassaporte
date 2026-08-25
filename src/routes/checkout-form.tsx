import { createFileRoute } from "@tanstack/react-router";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { CheckoutForm } from "@/components/gov/CheckoutForm";

export const Route = createFileRoute("/checkout-form")({
  ssr: false,
  component: CheckoutFormPage,
  head: () => ({
    meta: [
      { title: "Formulário do pedido — Guia do Passaporte" },
      {
        name: "description",
        content: "Preencha seus dados para receber o Guia do Passaporte em PDF.",
      },
      { property: "og:title", content: "Formulário do pedido — Guia do Passaporte" },
      {
        property: "og:description",
        content: "Formulário com dados pessoais para receber o guia personalizado.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CheckoutFormPage() {
  return (
    <>
      <GovHeader />
      <main>
        <CheckoutForm />
      </main>
      <GovFooter />
    </>
  );
}
