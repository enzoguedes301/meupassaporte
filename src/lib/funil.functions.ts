import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ETAPAS_FUNIL } from "@/lib/funil.constants";

const entrada = z.object({
  // Identificador anônimo gerado no navegador. Não carrega nada pessoal.
  visitante: z.string().uuid(),
  etapa: z.enum(ETAPAS_FUNIL),
});

/**
 * Marca que um visitante chegou a uma etapa. A gravação é idempotente: o mesmo
 * visitante repetindo a etapa sobrescreve a própria chave em vez de criar
 * outra, então a contagem é sempre de pessoas distintas.
 */
export const registrarEtapa = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entrada.parse(input))
  .handler(async ({ data }) => {
    const { firebaseFetch } = await import("./firebase.server");
    try {
      await firebaseFetch(`/funil/${data.visitante}.json`, {
        method: "PATCH",
        body: JSON.stringify({ [data.etapa]: new Date().toISOString() }),
      });
    } catch (erro) {
      // Métrica nunca deve atrapalhar a navegação de quem está comprando.
      console.error("Falha ao registrar etapa do funil:", erro);
    }
    return { ok: true as const };
  });
