import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  event: z.string().max(64),
  transaction: z
    .object({
      id: z.string().max(128).optional(),
      identifier: z.string().max(128).optional(),
      status: z.string().max(64).optional(),
    })
    .optional(),
});

export const Route = createFileRoute("/api/public/pagamentos/sigilopay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = payloadSchema.parse(await request.json());
        } catch {
          return new Response("Payload inválido", { status: 400 });
        }

        const transactionId = parsed.transaction?.id;
        if (!transactionId) return new Response("ok");

        // Nunca confiamos no corpo do webhook: confirmamos o status na API do gateway.
        const { buscarTransacao } = await import("@/lib/sigilopay.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let status: string;
        try {
          status = (await buscarTransacao(transactionId)).status;
        } catch (err) {
          console.error("Webhook: falha ao verificar transação", err);
          return new Response("Erro ao verificar transação", { status: 500 });
        }

        const novoStatus =
          status === "COMPLETED"
            ? "pago"
            : status === "FAILED"
              ? "falhou"
              : status === "REFUNDED" || status === "CHARGED_BACK"
                ? "estornado"
                : "pendente";

        const { error } = await supabaseAdmin
          .from("pedidos")
          .update({ status: novoStatus })
          .eq("transaction_id", transactionId);

        if (error) {
          console.error("Webhook: falha ao atualizar pedido", error);
          return new Response("Erro ao atualizar pedido", { status: 500 });
        }

        if (novoStatus === "pago") {
          const { entregarGuia } = await import("@/lib/entrega-guia.server");
          await entregarGuia(transactionId);
        }

        return new Response("ok");
      },
    },
  },
});
