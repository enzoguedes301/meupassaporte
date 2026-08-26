import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarGuiaPorEmail(input: {
  email: string;
  nome: string;
  pdfBase64: string;
}): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const resultado = await resend.emails.send({
      from: "Meu Passaporte <noreply@meupassaporte.digital>",
      to: input.email,
      subject: "Seu Guia do Primeiro Passaporte",
      html: `
        <h2>Olá, ${input.nome}!</h2>
        <p>Obrigado pela compra! 🎉</p>
        <p>Segue em anexo o seu Guia do Primeiro Passaporte com todas as informações para solicitar seu passaporte.</p>
        <p>Qualquer dúvida, estamos à disposição!</p>
        <p>Abraços,<br/>Equipe Meu Passaporte</p>
      `,
      attachments: [
        {
          filename: "Guia-Primeiro-Passaporte.pdf",
          content: input.pdfBase64,
          contentType: "application/pdf",
        },
      ],
    });

    if (resultado.error) {
      console.error("Erro ao enviar email Resend:", resultado.error);
      return { sucesso: false, erro: String(resultado.error) };
    }

    console.log("Email enviado com sucesso:", resultado.data?.id);
    return { sucesso: true };
  } catch (erro) {
    console.error("Erro inesperado ao enviar email:", erro);
    return { sucesso: false, erro: String(erro) };
  }
}
