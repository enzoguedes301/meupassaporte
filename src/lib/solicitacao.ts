import { CircleX, FilePlus2, PenLine, RefreshCw, Smile, Zap } from "lucide-react";

/** Tipos de solicitação oferecidos na caixa de seleção do hero e no formulário. */
export const TIPOS_SOLICITACAO = [
  {
    value: "primeira-via",
    label: "Primeira Via",
    descricao: "Nunca tive passaporte brasileiro",
    icon: FilePlus2,
  },
  {
    value: "renovacao",
    label: "Renovação",
    descricao: "Passaporte vencido ou prestes a vencer",
    icon: RefreshCw,
  },
  {
    value: "correcao-nome",
    label: "Mudança de nome",
    descricao: "Correção ou alteração de nome no passaporte",
    icon: PenLine,
  },
  {
    value: "extravio",
    label: "Perdido / extraviado",
    descricao: "Passaporte perdido, roubado ou extraviado",
    icon: CircleX,
  },
  {
    value: "urgencia",
    label: "Emergencial",
    descricao: "Preciso com urgência para viagem",
    icon: Zap,
  },
  {
    value: "menor",
    label: "Menor de Idade",
    descricao: "Passaporte para menor de 18 anos",
    icon: Smile,
  },
] as const;

export type TipoSolicitacaoLabel = (typeof TIPOS_SOLICITACAO)[number]["label"];

/** Mesma lista, só com os rótulos, no formato de tupla que o z.enum espera. */
export const TIPOS_SOLICITACAO_LABELS = TIPOS_SOLICITACAO.map(
  (tipo) => tipo.label,
) as unknown as readonly [TipoSolicitacaoLabel, ...TipoSolicitacaoLabel[]];

export function labelDoTipo(value: string) {
  return TIPOS_SOLICITACAO.find((tipo) => tipo.value === value)?.label ?? "";
}
