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

        // Modo teste: só fora de produção, para não liberar entrega gratuita do guia.
        let status: string;
        if (
          process.env.NODE_ENV !== "production" &&
          transactionId.startsWith("test-")
        ) {
          status = "COMPLETED";
          console.log("Webhook (modo teste):", transactionId);
        } else {
          // Nunca confiamos no corpo do webhook: confirmamos o status na API do gateway.
          const { buscarTransacao } = await import("@/lib/sigilopay.server");
          try {
            status = (await buscarTransacao(transactionId)).status;
          } catch (err) {
            console.error("Webhook: falha ao verificar transação", err);
            return new Response("Erro ao verificar transação", { status: 500 });
          }
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
          console.log("Status atualizado para PAGO, disparando entrega de guia...");
          const firebaseUrl = process.env.FIREBASE_DATABASE_URL;
          if (firebaseUrl) {
            try {
              console.log("Buscando pedido no Firebase com transactionId:", transactionId);
              const respPedidos = await fetch(`${firebaseUrl}/pedidos.json`);
              const todosPedidos = await respPedidos.json();

              let pedidoEncontrado = null;
              for (const pedidoId in todosPedidos) {
                if (todosPedidos[pedidoId].transactionId === transactionId) {
                  pedidoEncontrado = todosPedidos[pedidoId];
                  break;
                }
              }

              if (pedidoEncontrado) {
                console.log("Pedido encontrado para:", pedidoEncontrado.email);
                const { entregarGuia } = await import("@/lib/entrega-guia.server");
                await entregarGuia({
                  transactionId,
                  nome: pedidoEncontrado.nome,
                  email: pedidoEncontrado.email,
                });
              } else {
                console.error("Nenhum pedido encontrado para transactionId:", transactionId);
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
