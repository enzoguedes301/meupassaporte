import { JWT } from "google-auth-library";

const ESCOPOS = [
  "https://www.googleapis.com/auth/firebase.database",
  "https://www.googleapis.com/auth/userinfo.email",
];

let cliente: JWT | null | undefined;

/**
 * Conta de serviço do Firebase. Requisições autenticadas com ela ignoram as
 * regras do Realtime Database, que ficam fechadas para o mundo externo.
 */
function obterCliente(): JWT | null {
  if (cliente !== undefined) return cliente;

  const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!bruto) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT não configurada — requisições ao Firebase vão falhar com as regras fechadas."
    );
    cliente = null;
    return cliente;
  }

  try {
    const credencial = JSON.parse(bruto);
    cliente = new JWT({
      email: credencial.client_email,
      key: credencial.private_key,
      scopes: ESCOPOS,
    });
  } catch (erro) {
    console.error("FIREBASE_SERVICE_ACCOUNT inválida:", erro);
    cliente = null;
  }

  return cliente;
}

/**
 * Chama a REST API do Realtime Database já autenticada.
 * `caminho` é relativo à raiz do banco, ex.: `/pedidos/abc.json`.
 */
export async function firebaseFetch(
  caminho: string,
  init?: RequestInit
): Promise<Response> {
  const base = process.env.FIREBASE_DATABASE_URL;
  if (!base) throw new Error("FIREBASE_DATABASE_URL não configurada");

  const url = new URL(`${base}${caminho}`);

  const jwt = obterCliente();
  if (jwt) {
    const { token } = await jwt.getAccessToken();
    if (token) url.searchParams.set("access_token", token);
  }

  const resposta = await fetch(url, init);
  if (!resposta.ok) {
    throw new Error(
      `Firebase respondeu ${resposta.status}: ${await resposta.text()}`
    );
  }
  return resposta;
}

export type Pedido = {
  transactionId: string;
  nome: string;
  email: string;
  status: string;
  criadoEm: string;
};

export async function salvarPedido(
  pedidoId: string,
  pedido: Pedido
): Promise<void> {
  await firebaseFetch(`/pedidos/${pedidoId}.json`, {
    method: "PUT",
    body: JSON.stringify(pedido),
  });
}

export async function buscarPedidoPorTransacao(
  transactionId: string
): Promise<{ id: string; pedido: Pedido } | null> {
  const resposta = await firebaseFetch(
    `/pedidos.json?orderBy=${encodeURIComponent('"transactionId"')}&equalTo=${encodeURIComponent(`"${transactionId}"`)}`
  );
  const encontrados = (await resposta.json()) as Record<string, Pedido> | null;
  if (!encontrados) return null;

  const [id] = Object.keys(encontrados);
  if (!id) return null;

  return { id, pedido: encontrados[id] };
}

export async function atualizarStatusPedido(
  pedidoId: string,
  status: string
): Promise<void> {
  await firebaseFetch(`/pedidos/${pedidoId}.json`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
