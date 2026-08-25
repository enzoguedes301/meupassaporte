import { sendTemplateEmail } from "./email-templates/send-email";

/**
 * Envio do e-mail com o link do guia via infraestrutura de e-mail da Lovable.
 */
export async function enviarEmailGuia(input: {
  email: string;
  nome: string;
  link: string;
  pedidoId: string;
}): Promise<void> {
  const result = await sendTemplateEmail("guia-passaporte", input.email, {
    templateData: { nome: input.nome, link: input.link },
    idempotencyKey: `guia-passaporte-${input.pedidoId}`,
  });

  if (!result.sent) {
    console.warn(
      "[email-guia] destinatário suprimido, e-mail não enviado:",
      input.email,
      "pedido",
      input.pedidoId,
    );
  }
}
