const API_BASE = "https://app.sigilopay.com.br/api/v1";

function credentials() {
  const publicKey = process.env["SIGILOPAY_PUBLIC_KEY"];
  const secretKey = process.env["SIGILOPAY_SECRET_KEY"];
  if (!publicKey || !secretKey) {
    throw new Error("Credenciais do gateway de pagamento não configuradas.");
  }
  return { publicKey, secretKey };
}

async function request<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const { publicKey, secretKey } = credentials();

  const response = await fetch(`${API_BASE}${path}`, {
    method: init.method,
    headers: {
      "x-public-key": publicKey,
      "x-secret-key": secretKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`SigiloPay ${init.method} ${path} falhou [${response.status}]: ${text}`);
    throw new Error(`Falha no gateway de pagamento [${response.status}]: ${text}`);
  }

  return (text ? JSON.parse(text) : {}) as T;
}

export type PixReceiveResponse = {
  transactionId: string;
  status: string;
  fee?: number;
  order?: { id?: string; url?: string; receiptUrl?: string };
  pix?: { code?: string; image?: string; base64?: string };
  errorDescription?: string;
};

export function criarCobrancaPix(input: {
  identifier: string;
  amount: number;
  client: { name: string; email: string; document: string; phone?: string };
  products?: Array<{ id: string; name: string; quantity: number; price: number }>;
  metadata?: Record<string, string>;
  callbackUrl?: string;
}) {
  return request<PixReceiveResponse>("/gateway/pix/receive", {
    method: "POST",
    body: input,
  });
}

export type TransacaoResponse = {
  id: string;
  clientIdentifier?: string;
  amount?: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CHARGED_BACK";
  statusDescription?: string;
};

export function buscarTransacao(id: string) {
  return request<TransacaoResponse>(
    `/gateway/transactions?id=${encodeURIComponent(id)}`,
    { method: "GET" },
  );
}
