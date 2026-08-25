import fs from "fs";
import path from "path";

const PDF_PATH = path.join(process.cwd(), "public", "guia-primeiro-passaporte.pdf");

async function lerPdfComoBase64(): Promise<string> {
  try {
    const buffer = fs.readFileSync(PDF_PATH);
    return buffer.toString("base64");
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
