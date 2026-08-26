/**
 * Etapas de navegação do funil, na ordem em que acontecem.
 * As duas últimas etapas (PIX gerado e pago) não moram aqui: elas vêm dos
 * próprios pedidos, que são a fonte autoritativa para dinheiro.
 */
export const ETAPAS_FUNIL = [
  "site",
  "form1",
  "form2",
  "form3",
  "form4",
] as const;

export type EtapaFunil = (typeof ETAPAS_FUNIL)[number];

export const ROTULO_ETAPA: Record<EtapaFunil, string> = {
  site: "Entrou no site",
  form1: "Formulário — etapa 1",
  form2: "Formulário — etapa 2",
  form3: "Formulário — etapa 3",
  form4: "Formulário — etapa 4",
};
