async function lerPdfComoBase64(): Promise<string> {
  try {
    let url: string;
    if (process.env.VERCEL_URL) {
      url = `https://${process.env.VERCEL_URL}/guia-primeiro-passaporte.pdf`;
    } else {
      // Desenvolvimento local - usar porta dinâmica
      const host = process.env.HOST || '127.0.0.1';
      const port = process.env.PORT || '3000';
      url = `http://${host}:${port}/guia-primeiro-passaporte.pdf`;
    }
    const response = await fetch(url);

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
}): Promise<void> {
  try {
    const { enviarGuiaPorEmail } = await import("./resend-email.server");

    const pdfBase64 = await lerPdfComoBase64();

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
