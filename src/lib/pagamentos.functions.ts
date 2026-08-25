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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const identifier = crypto.randomUUID();
    const siteUrl = process.env["SITE_URL"] ?? "https://meu-passaporte-facil.lovable.app";

    const { data: pedido, error } = await supabaseAdmin
      .from("pedidos")
      .insert({
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        nascimento: data.nascimento,
        identifier,
        gateway: "sigilopay",
        amount_total: Math.round(VALOR_GUIA * 100),
        currency: "BRL",
        status: "pendente",
      })
      .select("id")
      .single();

    if (error || !pedido) {
      console.error("Falha ao registrar pedido:", error);
      throw new Error("Não foi possível registrar seu pedido. Tente novamente.");
    }

    const cobranca = await criarCobrancaPix({
      identifier,
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
      metadata: { pedidoId: pedido.id },
      callbackUrl: `${siteUrl}/api/public/pagamentos/sigilopay`,
    });

    await supabaseAdmin
      .from("pedidos")
      .update({
        transaction_id: cobranca.transactionId,
        pix_code: cobranca.pix?.code ?? null,
        pix_image: cobranca.pix?.image ?? null,
      })
      .eq("id", pedido.id);

    return {
      pedidoId: pedido.id as string,
      pixCode: cobranca.pix?.code ?? "",
      pixImage: cobranca.pix?.image ?? "",
      valor: VALOR_GUIA,
    };
  });

export const consultarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ pedidoId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buscarTransacao } = await import("@/lib/sigilopay.server");

    const { data: pedido } = await supabaseAdmin
      .from("pedidos")
      .select("id, status, transaction_id")
      .eq("id", data.pedidoId)
      .maybeSingle();

    if (!pedido) return { status: "nao_encontrado" as const, transactionId: null };
    if (pedido.status === "pago")
      return { status: "pago" as const, transactionId: pedido.transaction_id ?? null };

    if (pedido.transaction_id) {
      try {
        const transacao = await buscarTransacao(pedido.transaction_id);
        if (transacao.status === "COMPLETED") {
          await supabaseAdmin
            .from("pedidos")
            .update({ status: "pago" })
            .eq("id", pedido.id);
          const { entregarGuia } = await import("@/lib/entrega-guia.server");
          await entregarGuia(pedido.transaction_id);
          return { status: "pago" as const, transactionId: pedido.transaction_id };
        }
        if (transacao.status === "FAILED")
          return { status: "falhou" as const, transactionId: pedido.transaction_id };
      } catch (err) {
        console.error("Falha ao consultar transação:", err);
      }
    }

    return { status: "pendente" as const, transactionId: pedido.transaction_id ?? null };
  });
