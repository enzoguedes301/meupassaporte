import { registrarEtapa } from "@/lib/funil.functions";
import type { EtapaFunil } from "@/lib/funil.constants";

const CHAVE = "funil-visitante";

/**
 * Identificador anônimo do navegador. É um UUID aleatório, sem nada que
 * identifique a pessoa — serve só para não contar o mesmo visitante duas vezes.
 */
function idVisitante(): string | null {
  try {
    let id = localStorage.getItem(CHAVE);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    // Navegador anônimo ou storage bloqueado: seguimos sem medir.
    return null;
  }
}

const jaEnviadas = new Set<EtapaFunil>();

/**
 * Dispara e esquece: nunca bloqueia a navegação nem quebra a página se falhar.
 */
export function marcarEtapa(etapa: EtapaFunil): void {
  if (typeof window === "undefined") return;
  if (jaEnviadas.has(etapa)) return;
  jaEnviadas.add(etapa);

  const visitante = idVisitante();
  if (!visitante) return;

  void registrarEtapa({ data: { visitante, etapa } }).catch(() => {
    jaEnviadas.delete(etapa);
  });
}
