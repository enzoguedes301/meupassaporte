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

        const { buscarPedidoPorTransacao, atualizarStatusPedido } = await import(
          "@/lib/firebase.server"
        );

        let encontrado;
        try {
          encontrado = await buscarPedidoPorTransacao(transactionId);
        } catch (err) {
          console.error("Webhook: falha ao consultar pedido no Firebase", err);
          return new Response("Erro ao consultar pedido", { status: 500 });
        }

        if (!encontrado) {
          console.error("Webhook: nenhum pedido para a transação", transactionId);
          return new Response("ok");
        }

        try {
          await atualizarStatusPedido(encontrado.id, novoStatus);
        } catch (err) {
          console.error("Webhook: falha ao atualizar pedido no Firebase", err);
        }

        // Só entrega na transição para "pago", para não reenviar o guia caso o
        // gateway repita o webhook da mesma transação.
        if (novoStatus === "pago" && encontrado.pedido.status !== "pago") {
          const { entregarGuia } = await import("@/lib/entrega-guia.server");
          await entregarGuia({
            transactionId,
            nome: encontrado.pedido.nome,
            email: encontrado.pedido.email,
            origem: new URL(request.url).origin,
          });
        }

        return new Response("ok");
      },
    },
  },
});
