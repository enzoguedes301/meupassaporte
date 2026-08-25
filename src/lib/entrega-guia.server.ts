import { GUIA_BUCKET, GUIA_PATH } from "./guia.constants";

const EXPIRACAO_SEGUNDOS = 72 * 60 * 60; // 72 horas

/**
 * Gera o link assinado do guia e envia por e-mail ao comprador.
 * Idempotente: só envia se `guia_enviado_em` ainda estiver vazio.
 * Nunca lança erro — falhas são apenas registradas em log.
 */
export async function entregarGuia(transactionId: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pedido, error } = await supabaseAdmin
      .from("pedidos")
      .select("id, nome, email, guia_enviado_em")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (error || !pedido) {
      console.error("Entrega do guia: pedido não encontrado", transactionId, error);
      return;
    }

    if (pedido.guia_enviado_em) return; // já entregue

    // Reserva o envio antes de disparar o e-mail (evita duplicidade em webhooks simultâneos)
    const { data: reservado } = await supabaseAdmin
      .from("pedidos")
      .update({ guia_enviado_em: new Date().toISOString() })
      .eq("id", pedido.id)
      .is("guia_enviado_em", null)
      .select("id")
      .maybeSingle();

    if (!reservado) return; // outro processo já está enviando

    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(GUIA_BUCKET)
      .createSignedUrl(GUIA_PATH, EXPIRACAO_SEGUNDOS);

    if (signedError || !signed?.signedUrl) {
      console.error("Entrega do guia: falha ao gerar link assinado", signedError);
      await supabaseAdmin.from("pedidos").update({ guia_enviado_em: null }).eq("id", pedido.id);
      return;
    }

    try {
      const { enviarEmailGuia } = await import("./email-guia.server");
      await enviarEmailGuia({
        email: pedido.email,
        nome: pedido.nome,
        link: signed.signedUrl,
        pedidoId: pedido.id,
      });
    } catch (sendError) {
      console.error("Entrega do guia: falha ao enviar e-mail", sendError);
      await supabaseAdmin.from("pedidos").update({ guia_enviado_em: null }).eq("id", pedido.id);
    }
  } catch (err) {
    console.error("Entrega do guia: erro inesperado", err);
  }
}
