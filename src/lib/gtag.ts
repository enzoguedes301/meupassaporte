/* =========================================================================
 * GOOGLE ADS — COLE AQUI OS DOIS VALORES DO GOOGLE ADS
 * -------------------------------------------------------------------------
 * 1) GOOGLE_ADS_CONVERSION_ID: o ID da conta (formato "AW-0000000000").
 *    Já está preenchido e também é usado na tag base em src/routes/__root.tsx.
 * 2) CONVERSION_LABEL: o label da ação de conversão "Compra".
 *    No Google Ads: Objetivos > Conversões > (sua ação) > Configurar tag.
 *    O trecho send_to aparece como "AW-18362993408/AbC-D_efGhIj";
 *    cole APENAS a parte depois da barra abaixo.
 * ========================================================================= */
export const GOOGLE_ADS_CONVERSION_ID = "AW-18362993408";
export const CONVERSION_LABEL = "eZlvCKuZttocEICWlLRE"; // <-- COLE O LABEL AQUI

export const GOOGLE_ADS_ID = GOOGLE_ADS_CONVERSION_ID;
export const CONVERSAO_COMPRA_SEND_TO = `${GOOGLE_ADS_CONVERSION_ID}/${CONVERSION_LABEL}`;

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === "function" ? fn : null;
}

/**
 * Dispara a conversão de compra apenas uma vez por transação confirmada.
 */
export function dispararConversaoCompra(transactionId: string, valor = 239.9) {
  if (!transactionId) return;
  if ((CONVERSION_LABEL as string) === "COLOCAR_LABEL_AQUI") {
    console.warn("[Google Ads] CONVERSION_LABEL ainda não configurado em src/lib/gtag.ts");
    return;
  }
  const chave = `gads-conversao:${transactionId}`;
  try {
    if (localStorage.getItem(chave)) return;
  } catch {
    /* storage indisponível: segue com o disparo */
  }

  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "conversion", {
    send_to: CONVERSAO_COMPRA_SEND_TO,
    value: valor,
    currency: "BRL",
    transaction_id: transactionId,
  });

  try {
    localStorage.setItem(chave, "1");
  } catch {
    /* ignora */
  }
}
