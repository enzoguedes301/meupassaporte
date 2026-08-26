/**
 * O PDF mora em `public/`, servido como asset estático. Em produção usamos a
 * URL do deploy (o Vercel injeta VERCEL_URL); em desenvolvimento, a origem da
 * própria requisição, que já traz a porta correta. Não usamos a origem em
 * produção para que um Host forjado não faça o servidor anexar outro arquivo.
 */
async function lerPdfComoBase64(origem?: string): Promise<string> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (origem ?? "http://127.0.0.1:3000");

    const response = await fetch(`${base}/guia-primeiro-passaporte.pdf`);

    if (!response.ok) {
      throw new Error(`Falha ao buscar PDF: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  } catch (erro) {
    console.error("Erro ao ler PDF:", erro);
    throw new Error("Não foi possível ler o arquivo PDF");
  }
}

export async function entregarGuia(input: {
  transactionId: string;
  nome: string;
  email: string;
  origem?: string;
}): Promise<void> {
  try {
    const { enviarGuiaPorEmail } = await import("./resend-email.server");

    const pdfBase64 = await lerPdfComoBase64(input.origem);

    const resultado = await enviarGuiaPorEmail({
      email: input.email,
      nome: input.nome,
      pdfBase64,
    });

    if (resultado.sucesso) {
      console.log(
        "Guia entregue com sucesso para:",
        input.email,
        "- Transação:",
        input.transactionId
      );
    } else {
      console.error(
        "Falha ao enviar guia para:",
        input.email,
        "Erro:",
        resultado.erro
      );
    }
  } catch (err) {
    console.error("Erro ao entregar guia:", err);
  }
}
