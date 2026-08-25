import { z } from "zod";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = "https://api.asaas.com/v3";

export const criarPagamentoAsaasSchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  cpf: z.string(),
  valor: z.number().positive(),
  descricao: z.string().optional(),
});

export type CriarPagamentoAsaasInput = z.infer<typeof criarPagamentoAsaasSchema>;

export interface RespostaPagamentoAsaas {
  id: string;
  qrCode: string;
  qrCodeUrl: string;
  pixCopyPaste: string;
  status: string;
  valor: number;
}

/**
 * Criar um pagamento PIX no Asaas
 */
export async function criarPagamentoAsaas(
  dados: CriarPagamentoAsaasInput
): Promise<RespostaPagamentoAsaas> {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não configurada");
  }

  try {
    // 1. Criar cliente se não existir
    const cliente = await criarOuBuscarClienteAsaas(dados.nome, dados.email, dados.cpf);

    // 2. Criar cobrança com PIX
    const cobranca = await criarCobrancaAsaas(cliente.id, dados.valor, dados.descricao);

    // 3. Gerar QR Code PIX
    const qrCode = await gerarQrCodePix(cobranca.id);

    return {
      id: cobranca.id,
      qrCode: qrCode.qrCode,
      qrCodeUrl: qrCode.qrCodeUrl,
      pixCopyPaste: qrCode.pixCopyPaste,
      status: cobranca.status,
      valor: cobranca.valor,
    };
  } catch (erro) {
    console.error("Erro ao criar pagamento Asaas:", erro);
    throw new Error(`Erro ao criar pagamento PIX: ${erro instanceof Error ? erro.message : "Erro desconhecido"}`);
  }
}

/**
 * Criar ou buscar cliente no Asaas
 */
async function criarOuBuscarClienteAsaas(
  nome: string,
  email: string,
  cpf: string
): Promise<{ id: string }> {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY vazia - não configurada no ambiente");
  }

  try {
    // Buscar cliente existente por CPF
    const respBusca = await fetch(
      `${ASAAS_BASE_URL}/customers?cpfCnpj=${cpf.replace(/\D/g, "")}`,
      {
        headers: {
          "access-token": ASAAS_API_KEY,
        },
      }
    );

    if (respBusca.ok) {
      const texto = await respBusca.text();
      console.log("Resposta Asaas buscar cliente:", texto);
      if (!texto) throw new Error("Resposta vazia do Asaas");
      const dados = JSON.parse(texto);
      if (dados.data && dados.data.length > 0) {
        return { id: dados.data[0].id };
      }
    } else {
      const erro = await respBusca.text();
      console.log("Erro ao buscar cliente:", respBusca.status, erro);
      throw new Error(`Erro ${respBusca.status}: ${erro}`);
    }

    // Se não encontrar, criar novo cliente
    const respCriar = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ASAAS_API_KEY}`,
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        cpfCnpj: cpf.replace(/\D/g, ""),
      }),
    });

    if (!respCriar.ok) {
      const erro = await respCriar.text();
      throw new Error(`Erro ao criar cliente: ${erro}`);
    }

    const texto = await respCriar.text();
    const novoCliente = JSON.parse(texto);
    return { id: novoCliente.id };
  } catch (erro) {
    throw new Error(`Erro ao gerenciar cliente: ${erro instanceof Error ? erro.message : "Erro desconhecido"}`);
  }
}

/**
 * Criar cobrança no Asaas
 */
async function criarCobrancaAsaas(
  clienteId: string,
  valor: number,
  descricao?: string
): Promise<{ id: string; status: string; valor: number }> {
  const resp = await fetch(`${ASAAS_BASE_URL}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ASAAS_API_KEY}`,
    },
    body: JSON.stringify({
      customerId: clienteId,
      billingType: "PIX",
      value: valor,
      dueDate: new Date().toISOString().split("T")[0], // Hoje
      description: descricao || "Guia do Passaporte",
    }),
  });

  console.log("Status cobranca:", resp.status, "OK:", resp.ok);
  const texto = await resp.text();
  console.log("Resposta cobranca:", texto);

  if (!resp.ok) {
    throw new Error(`Erro ${resp.status} ao criar cobrança: ${texto}`);
  }

  if (!texto) throw new Error("Resposta vazia ao criar cobrança");
  const cobranca = JSON.parse(texto);
  return {
    id: cobranca.id,
    status: cobranca.status,
    valor: cobranca.value,
  };
}

/**
 * Gerar QR Code PIX
 */
async function gerarQrCodePix(
  cobrancaId: string
): Promise<{ qrCode: string; qrCodeUrl: string; pixCopyPaste: string }> {
  const resp = await fetch(`${ASAAS_BASE_URL}/charges/${cobrancaId}/pix/qrcode`, {
    headers: {
      "Authorization": `Bearer ${ASAAS_API_KEY}`,
    },
  });

  if (!resp.ok) {
    throw new Error("Erro ao gerar QR Code PIX");
  }

  const dados = await resp.json();
  return {
    qrCode: dados.qrCode,
    qrCodeUrl: dados.qrCodeUrl,
    pixCopyPaste: dados.pixCopyPaste,
  };
}

/**
 * Verificar status de um pagamento
 */
export async function verificarStatusPagamento(cobrancaId: string): Promise<string> {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não configurada");
  }

  const resp = await fetch(`${ASAAS_BASE_URL}/charges/${cobrancaId}`, {
    headers: {
      "Authorization": `Bearer ${ASAAS_API_KEY}`,
    },
  });

  if (!resp.ok) {
    throw new Error("Erro ao verificar status do pagamento");
  }

  const dados = await resp.json();
  return dados.status; // PENDING, CONFIRMED, etc
}
