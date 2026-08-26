import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VALOR_GUIA = 239.9;

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

export const consultarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ transactionId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { buscarTransacao } = await import("@/lib/sigilopay.server");

    try {
      const transacao = await buscarTransacao(data.transactionId);

      if (transacao.status === "COMPLETED") {
        return { status: "pago" as const, transactionId: data.transactionId };
      }
      if (transacao.status === "FAILED") {
        return { status: "falhou" as const, transactionId: data.transactionId };
      }
      return { status: "pendente" as const, transactionId: data.transactionId };
    } catch (err) {
      console.error("Falha ao consultar transação:", err);
      return { status: "erro" as const, transactionId: data.transactionId };
    }
  });
