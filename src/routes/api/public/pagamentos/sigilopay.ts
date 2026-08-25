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

        const firebaseUrl = process.env.FIREBASE_DATABASE_URL;
        if (firebaseUrl) {
          try {
            await fetch(
              `${firebaseUrl}/pedidos.json?orderBy="transactionId"&equalTo="${transactionId}"`,
              {
                method: "PATCH",
                body: JSON.stringify({ status: novoStatus }),
              }
            );
          } catch (err) {
            console.error("Webhook: falha ao atualizar pedido no Firebase", err);
          }
        }

        if (novoStatus === "pago") {
          const firebaseUrl = process.env.FIREBASE_DATABASE_URL;
          if (firebaseUrl) {
            try {
              const respPedido = await fetch(
                `${firebaseUrl}/pedidos.json?orderBy="transactionId"&equalTo="${transactionId}"`
              );
              const pedidos = await respPedido.json();

              if (pedidos && Object.keys(pedidos).length > 0) {
                const pedidoId = Object.keys(pedidos)[0];
                const pedido = pedidos[pedidoId];

                const { entregarGuia } = await import("@/lib/entrega-guia.server");
                await entregarGuia({
                  transactionId,
                  nome: pedido.nome,
                  email: pedido.email,
                });
              }
            } catch (err) {
              console.error("Erro ao recuperar dados do pedido:", err);
            }
          }
        }

        return new Response("ok");
      },
    },
  },
});
