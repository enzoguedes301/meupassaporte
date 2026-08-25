import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VALOR_GUIA = 239.9;
const FIREBASE_DB_URL = "https://meupassaporte-ac920-default-rtdb.firebaseio.com";

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
    const { criarPagamentoAsaas } = await import("@/lib/asaas-pagamento.server");

    const pedidoId = crypto.randomUUID();
    const agora = new Date().toISOString();

    const insertResp = await fetch(`${FIREBASE_DB_URL}/orders/${pedidoId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: pedidoId,
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        nascimento: data.nascimento,
        gateway: "asaas",
        amount_total: Math.round(VALOR_GUIA * 100),
        currency: "BRL",
        status: "pendente",
        created_at: agora,
        updated_at: agora,
      }),
    });

    if (!insertResp.ok) {
      const erro = await insertResp.text();
      console.error("Falha ao registrar pedido:", erro);
      throw new Error("Não foi possível registrar seu pedido. Tente novamente.");
    }

    const cobranca = await criarPagamentoAsaas({
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      valor: VALOR_GUIA,
      descricao: "Guia do Primeiro Passaporte (PDF)",
    });

    await fetch(`${FIREBASE_DB_URL}/orders/${pedidoId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: cobranca.id,
        pix_code: cobranca.pixCopyPaste ?? null,
        pix_image: cobranca.qrCodeUrl ?? null,
        updated_at: new Date().toISOString(),
      }),
    });

    return {
      pedidoId,
      pixCode: cobranca.pixCopyPaste ?? "",
      pixImage: cobranca.qrCodeUrl ?? "",
      valor: VALOR_GUIA,
    };
  });

export const consultarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ pedidoId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { verificarStatusPagamento } = await import("@/lib/asaas-pagamento.server");

    const getResp = await fetch(`${FIREBASE_DB_URL}/orders/${data.pedidoId}.json`);

    if (!getResp.ok) {
      return { status: "nao_encontrado" as const, transactionId: null };
    }

    const pedido = await getResp.json();

    if (!pedido) return { status: "nao_encontrado" as const, transactionId: null };
    if (pedido.status === "pago")
      return { status: "pago" as const, transactionId: pedido.transaction_id ?? null };

    if (pedido.transaction_id) {
      try {
        const statusAsaas = await verificarStatusPagamento(pedido.transaction_id);
        if (statusAsaas === "CONFIRMED") {
          await fetch(`${FIREBASE_DB_URL}/orders/${data.pedidoId}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "pago",
              updated_at: new Date().toISOString(),
            }),
          });
          const { entregarGuia } = await import("@/lib/entrega-guia.server");
          await entregarGuia(pedido.transaction_id);
          return { status: "pago" as const, transactionId: pedido.transaction_id };
        }
        if (statusAsaas === "FAILED")
          return { status: "falhou" as const, transactionId: pedido.transaction_id };
      } catch (err) {
        console.error("Falha ao consultar transação:", err);
      }
    }

    return { status: "pendente" as const, transactionId: pedido.transaction_id ?? null };
  });
