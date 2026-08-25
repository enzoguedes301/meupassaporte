async function lerPdfComoBase64(): Promise<string> {
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/guia-primeiro-passaporte.pdf`);

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
