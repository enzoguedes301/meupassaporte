import { useNavigate } from "@tanstack/react-router";

/**
 * Leva ao formulário já com o capítulo escolhido, para que o comprador não
 * precise responder de novo o que já disse no botão.
 *
 * Mesclamos com o que estiver salvo em vez de sobrescrever: quem voltou ao
 * início no meio da compra não perde os dados que já havia preenchido.
 */
export function useIrParaCompra() {
  const navigate = useNavigate();

  return (tipo: string) => {
    try {
      const salvo = sessionStorage.getItem("formulario-checkout");
      const dados = salvo ? (JSON.parse(salvo) as Record<string, unknown>) : {};
      sessionStorage.setItem(
        "formulario-checkout",
        JSON.stringify({ ...dados, tipoSolicitacao: tipo }),
      );
    } catch {
      //
    }
    void navigate({ to: "/checkout-form" });
  };
}
