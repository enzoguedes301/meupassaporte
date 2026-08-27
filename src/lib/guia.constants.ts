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

/**
 * Contato do vendedor.
 *
 * Razão social, CNPJ e endereço ficaram de fora por ora: eles precisam bater
 * com o cadastro do anunciante no Google Ads, e publicar dados divergentes é
 * pior do que não publicar nenhum.
 */
export const EMPRESA = {
  email: "chasecador123@gmail.com",
} as const;
