export const GUIA_BUCKET = "guias-pdf";
export const GUIA_PATH = "guia-primeiro-passaporte.pdf";

/** Preço do nosso produto: o guia em PDF. Não tem relação com a taxa oficial. */
export const VALOR_GUIA = 239.9;

/**
 * Taxa oficial do passaporte (GRU), paga diretamente à Polícia Federal — nunca
 * a nós. Exibimos lado a lado com o nosso preço para deixar explícito que são
 * dois pagamentos distintos. Confira o valor vigente antes de atualizar aqui.
 */
export const TAXA_GRU_COMUM = 257.25;
export const URL_GRU_OFICIAL =
  "https://www.gov.br/pf/pt-br/assuntos/passaporte";

export const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Identificação legal do vendedor — exigida pelas políticas de anúncio. */
export const EMPRESA = {
  razaoSocial: "C6M Soluções",
  cnpj: "01.086.251/0001-01",
  endereco: "Rua Antônio Vicente de Paula, 736 — Jardim Samambaia, Campinas/SP",
  email: "chasecador123@gmail.com",
} as const;
