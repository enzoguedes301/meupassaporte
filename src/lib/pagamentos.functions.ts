import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { VALOR_GUIA } from "@/lib/guia.constants";

const dadosSchema = z.object({
  nome: z.string().trim().min(5).max(120),
  email: z.string().trim().email().max(255),
  cpf: z.string().trim().min(11).max(14),
  telefone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido"),
  nascimento: z.string().trim().min(8).max(10),
});

export const criarPagamentoPix = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => dadosSchema.parse(input))
  .handler(async ({ data }) => {
    const { criarCobrancaPix } = await import("@/lib/sigilopay.server");

    const pedidoId = crypto.randomUUID();

    const resultado = await criarCobrancaPix({
      identifier: pedidoId,
      amount: VALOR_GUIA,
      client: {
        name: data.nome,
        email: data.email,
        document: data.cpf.replace(/\D/g, ""),
        phone: data.telefone,
      },
      products: [
        {
          id: "guia-passaporte",
          name: "Guia do Primeiro Passaporte (PDF)",
          quantity: 1,
          price: VALOR_GUIA,
        },
      ],
      metadata: {
        nascimento: data.nascimento,
      },
    });

    const { salvarPedido } = await import("@/lib/firebase.server");
    try {
      await salvarPedido(pedidoId, {
        transactionId: resultado.transactionId,
        nome: data.nome,
        email: data.email,
        status: "pendente",
        criadoEm: new Date().toISOString(),
      });
    } catch (erro) {
      console.error("Erro ao salvar pedido no Firebase:", erro);
    }

    return {
      pedidoId,
      transactionId: resultado.transactionId,
      pixCode: resultado.pix?.code ?? "",
      pixImage: resultado.pix?.image ?? "",
      valor: VALOR_GUIA,
    };
  });

/**
 * Consulta o pedido pelo id que a página de retorno tem na URL.
 *
 * O status gravado no Firebase pelo webhook é a fonte principal. Se ainda
 * estiver pendente, confirmamos direto no gateway — assim o cliente não fica
 * preso numa tela de "aguardando" caso o webhook atrase ou não chegue, e a
 * entrega do guia acontece mesmo assim.
 */
export const consultarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ pedidoId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { firebaseFetch, atualizarStatusPedido } = await import(
      "@/lib/firebase.server"
    );

    let pedido: { transactionId: string; nome: string; email: string; status: string } | null;
    try {
      const resposta = await firebaseFetch(`/pedidos/${data.pedidoId}.json`);
      pedido = await resposta.json();
    } catch (err) {
      console.error("Falha ao ler pedido:", err);
      return { status: "erro" as const, transactionId: null };
    }

    if (!pedido) return { status: "nao-encontrado" as const, transactionId: null };

    if (pedido.status === "pago") {
      return { status: "pago" as const, transactionId: pedido.transactionId };
    }
    if (pedido.status === "falhou" || pedido.status === "estornado") {
      return { status: "falhou" as const, transactionId: pedido.transactionId };
    }

    try {
      const { buscarTransacao } = await import("@/lib/sigilopay.server");
      const transacao = await buscarTransacao(pedido.transactionId);

      if (transacao.status === "COMPLETED") {
        await atualizarStatusPedido(data.pedidoId, "pago");

        // Rede de segurança: se o webhook não entregou, entregamos aqui.
        const { entregarGuia } = await import("@/lib/entrega-guia.server");
        await entregarGuia({
          transactionId: pedido.transactionId,
          nome: pedido.nome,
          email: pedido.email,
        });

        return { status: "pago" as const, transactionId: pedido.transactionId };
      }

      if (transacao.status === "FAILED") {
        await atualizarStatusPedido(data.pedidoId, "falhou");
        return { status: "falhou" as const, transactionId: pedido.transactionId };
      }

      return { status: "pendente" as const, transactionId: pedido.transactionId };
    } catch (err) {
      console.error("Falha ao consultar transação:", err);
      return { status: "erro" as const, transactionId: pedido.transactionId };
    }
  });
