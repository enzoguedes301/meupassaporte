import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { PAISES, UFS } from "@/lib/paises";
import { TIPOS_SOLICITACAO_LABELS } from "@/lib/solicitacao";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function maskDate(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCPF(raw: string) {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function isValidBirthDate(value: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return false;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  )
    return false;
  const now = new Date();
  return date <= now && Number(yyyy) >= 1900;
}

const schema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(5, { message: "Informe seu nome completo" })
      .max(120, { message: "Nome muito longo" })
      .refine((v) => v.split(/\s+/).length >= 2, { message: "Informe nome e sobrenome" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Informe seu e-mail" })
      .email({ message: "E-mail inválido" })
      .max(255, { message: "E-mail muito longo" }),
    cpf: z.string().refine(isValidCPF, { message: "CPF inválido" }),
    telefone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 11, {
        message: "Telefone inválido (DDD + número)",
      }),
    nascimento: z.string().refine(isValidBirthDate, { message: "Data inválida (dd/mm/aaaa)" }),
    paisNascimento: z.string().trim().min(1, { message: "Selecione o país de nascimento" }),
    cidadeNascimento: z
      .string()
      .trim()
      .min(2, { message: "Informe a cidade de nascimento" })
      .max(120, { message: "Cidade muito longa" }),
    ufNascimento: z.string().trim().max(2).optional(),
    cidade: z
      .string()
      .trim()
      .min(2, { message: "Informe sua cidade atual" })
      .max(120, { message: "Cidade muito longa" }),
    cor: z.enum(["Branco", "Preto", "Pardo", "Amarelo", "Indígena"], {
      message: "Selecione uma opção",
    }),
    situacaoCivil: z.enum(["Casado", "Solteiro", "União Estável"], {
      message: "Selecione uma opção",
    }),
    nomeMae: z
      .string()
      .trim()
      .min(5, { message: "Informe o nome completo da mãe" })
      .max(120, { message: "Nome muito longo" })
      .refine((v) => v.split(/\s+/).length >= 2, { message: "Informe nome e sobrenome" }),
    nascimentoMae: z.string().refine(isValidBirthDate, { message: "Data inválida (dd/mm/aaaa)" }),
    maeConstaDocumento: z.boolean(),
    nomePai: z
      .string()
      .trim()
      .min(5, { message: "Informe o nome completo do pai" })
      .max(120, { message: "Nome muito longo" })
      .refine((v) => v.split(/\s+/).length >= 2, { message: "Informe nome e sobrenome" }),
    nascimentoPai: z.string().refine(isValidBirthDate, { message: "Data inválida (dd/mm/aaaa)" }),
    possuiRg: z.enum(["Sim", "Não"], { message: "Selecione uma opção" }),
    orgaoEmissorRg: z.string().trim().optional(),
    ufRg: z.string().trim().optional(),
    tipoSolicitacao: z.enum(TIPOS_SOLICITACAO_LABELS, {
      message: "Selecione uma opção",
    }),
    cpfRegularizado: z.enum(["Sim", "Não", "Não sei"], {
      message: "Selecione uma opção",
    }),
    contaGovBr: z.enum(["Sim", "Não", "Não sei"], {
      message: "Selecione uma opção",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.possuiRg === "Sim") {
      if (!data.orgaoEmissorRg) {
        ctx.addIssue({
          code: "custom",
          path: ["orgaoEmissorRg"],
          message: "Selecione o órgão emissor",
        });
      }
      if (!data.ufRg) {
        ctx.addIssue({
          code: "custom",
          path: ["ufRg"],
          message: "Selecione o estado de emissão",
        });
      }
    }
  });

const CORES = ["Branco", "Preto", "Pardo", "Amarelo", "Indígena"] as const;
const SITUACOES = ["Casado", "Solteiro", "União Estável"] as const;
const ORGAOS_RG = ["SSP", "DETRAN", "PF/DPF", "IFP", "IIRGD", "Outro"] as const;
const SIM_NAO = ["Sim", "Não"] as const;
const SIM_NAO_NAOSEI = ["Sim", "Não", "Não sei"] as const;

type Campos = z.infer<typeof schema>;
type Erros = Partial<Record<keyof Campos, string>>;
type FormState = Omit<
  Campos,
  "cor" | "situacaoCivil" | "possuiRg" | "tipoSolicitacao" | "cpfRegularizado" | "contaGovBr"
> & {
  cor: string;
  situacaoCivil: string;
  possuiRg: string;
  tipoSolicitacao: string;
  cpfRegularizado: string;
  contaGovBr: string;
};

const inputClass =
  "focus-gov mt-1.5 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground";

type SolicitacaoDialogProps = {
  /** Gatilho opcional. Sem ele, o diálogo é controlado por `open`/`onOpenChange`. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Rótulo do tipo escolhido na caixa de seleção do hero. */
  tipoInicial?: string;
};

export function SolicitacaoDialog({
  children,
  open: openProp,
  onOpenChange,
  tipoInicial,
}: SolicitacaoDialogProps) {
  const navigate = useNavigate();
  const [openInterno, setOpenInterno] = useState(false);
  const open = openProp ?? openInterno;

  function setOpen(valor: boolean) {
    setOpenInterno(valor);
    onOpenChange?.(valor);
  }

  const [values, setValues] = useState<FormState>({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    nascimento: "",
    paisNascimento: "Brasil",
    cidadeNascimento: "",
    ufNascimento: "",
    cidade: "",
    cor: "",
    situacaoCivil: "",
    nomeMae: "",
    nascimentoMae: "",
    maeConstaDocumento: false,
    nomePai: "",
    nascimentoPai: "",
    possuiRg: "",
    orgaoEmissorRg: "",
    ufRg: "",
    tipoSolicitacao: "",
    cpfRegularizado: "",
    contaGovBr: "",
  });
  const [errors, setErrors] = useState<Erros>({});

  useEffect(() => {
    if (!open || !tipoInicial) return;
    setValues((prev) =>
      prev.tipoSolicitacao === tipoInicial ? prev : { ...prev, tipoSolicitacao: tipoInicial },
    );
  }, [open, tipoInicial]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Erros = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Campos;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setOpen(false);
    sessionStorage.setItem("solicitacao-guia", JSON.stringify(result.data));
    navigate({ to: "/checkout" });
  }

  function update(field: keyof FormState, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg p-0">
        <div className="gov-stripe h-1.5" aria-hidden />
        <div className="p-6">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="font-display text-xl font-extrabold text-primary-darker">
              Dados do solicitante
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Preencha os dados abaixo para continuar para o pagamento.
            </DialogDescription>
          </DialogHeader>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="nome" className="text-sm font-semibold text-primary-darker">
                Nome completo
              </label>
              <input
                id="nome"
                name="nome"
                autoComplete="name"
                maxLength={120}
                className={inputClass}
                placeholder="Como consta no documento"
                value={values.nome}
                onChange={(e) => update("nome", e.target.value)}
                aria-invalid={!!errors.nome}
              />
              {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-primary-darker">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                className={inputClass}
                placeholder="Seu email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="cpf" className="text-sm font-semibold text-primary-darker">
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                inputMode="numeric"
                className={inputClass}
                placeholder="000.000.000-00"
                value={values.cpf}
                onChange={(e) => update("cpf", maskCPF(e.target.value))}
                aria-invalid={!!errors.cpf}
              />
              {errors.cpf && <p className="mt-1 text-xs text-destructive">{errors.cpf}</p>}
            </div>

            <div>
              <label htmlFor="telefone" className="text-sm font-semibold text-primary-darker">
                Telefone (WhatsApp)
              </label>
              <input
                id="telefone"
                name="telefone"
                inputMode="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="(11) 99999-9999"
                value={values.telefone}
                onChange={(e) => update("telefone", maskPhone(e.target.value))}
                aria-invalid={!!errors.telefone}
              />
              {errors.telefone && (
                <p className="mt-1 text-xs text-destructive">{errors.telefone}</p>
              )}
            </div>

            <div>
              <label htmlFor="nascimento" className="text-sm font-semibold text-primary-darker">
                Data de nascimento
              </label>
              <input
                id="nascimento"
                name="nascimento"
                inputMode="numeric"
                className={inputClass}
                placeholder="dd/mm/aaaa"
                value={values.nascimento}
                onChange={(e) => update("nascimento", maskDate(e.target.value))}
                aria-invalid={!!errors.nascimento}
              />
              {errors.nascimento && (
                <p className="mt-1 text-xs text-destructive">{errors.nascimento}</p>
              )}
            </div>

            <fieldset className="rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-bold text-primary-darker">Naturalidade</legend>

              <div>
                <label
                  htmlFor="paisNascimento"
                  className="text-sm font-semibold text-primary-darker"
                >
                  País de nascimento
                </label>
                <select
                  id="paisNascimento"
                  name="paisNascimento"
                  className={inputClass}
                  value={values.paisNascimento}
                  onChange={(e) => update("paisNascimento", e.target.value)}
                  aria-invalid={!!errors.paisNascimento}
                >
                  <option value="">Selecione</option>
                  {PAISES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.paisNascimento && (
                  <p className="mt-1 text-xs text-destructive">{errors.paisNascimento}</p>
                )}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="cidadeNascimento"
                  className="text-sm font-semibold text-primary-darker"
                >
                  Cidade de nascimento
                </label>
                <input
                  id="cidadeNascimento"
                  name="cidadeNascimento"
                  maxLength={120}
                  className={inputClass}
                  placeholder="Cidade onde nasceu"
                  value={values.cidadeNascimento}
                  onChange={(e) => update("cidadeNascimento", e.target.value)}
                  aria-invalid={!!errors.cidadeNascimento}
                />
                {errors.cidadeNascimento && (
                  <p className="mt-1 text-xs text-destructive">{errors.cidadeNascimento}</p>
                )}
              </div>

              {values.paisNascimento === "Brasil" && (
                <div className="mt-4">
                  <label
                    htmlFor="ufNascimento"
                    className="text-sm font-semibold text-primary-darker"
                  >
                    Estado (UF)
                  </label>
                  <select
                    id="ufNascimento"
                    name="ufNascimento"
                    className={inputClass}
                    value={values.ufNascimento ?? ""}
                    onChange={(e) => update("ufNascimento", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="cidade" className="text-sm font-semibold text-primary-darker">
                  Cidade
                </label>
                <input
                  id="cidade"
                  name="cidade"
                  maxLength={120}
                  className={inputClass}
                  placeholder="Cidade onde reside atualmente"
                  value={values.cidade}
                  onChange={(e) => update("cidade", e.target.value)}
                  aria-invalid={!!errors.cidade}
                />
                {errors.cidade && <p className="mt-1 text-xs text-destructive">{errors.cidade}</p>}
              </div>
            </fieldset>

            <div>
              <label htmlFor="cor" className="text-sm font-semibold text-primary-darker">
                Cor
              </label>
              <select
                id="cor"
                name="cor"
                className={inputClass}
                value={values.cor}
                onChange={(e) => update("cor", e.target.value)}
                aria-invalid={!!errors.cor}
              >
                <option value="">Selecione</option>
                {CORES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.cor && <p className="mt-1 text-xs text-destructive">{errors.cor}</p>}
            </div>

            <div>
              <label htmlFor="situacaoCivil" className="text-sm font-semibold text-primary-darker">
                Situação civil
              </label>
              <select
                id="situacaoCivil"
                name="situacaoCivil"
                className={inputClass}
                value={values.situacaoCivil}
                onChange={(e) => update("situacaoCivil", e.target.value)}
                aria-invalid={!!errors.situacaoCivil}
              >
                <option value="">Selecione</option>
                {SITUACOES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.situacaoCivil && (
                <p className="mt-1 text-xs text-destructive">{errors.situacaoCivil}</p>
              )}
            </div>

            <div>
              <label htmlFor="nomeMae" className="text-sm font-semibold text-primary-darker">
                Nome completo da mãe
              </label>
              <input
                id="nomeMae"
                name="nomeMae"
                maxLength={120}
                className={inputClass}
                placeholder="Como consta no documento"
                value={values.nomeMae}
                onChange={(e) => update("nomeMae", e.target.value)}
                aria-invalid={!!errors.nomeMae}
              />
              {errors.nomeMae && <p className="mt-1 text-xs text-destructive">{errors.nomeMae}</p>}
            </div>

            <div>
              <label htmlFor="nascimentoMae" className="text-sm font-semibold text-primary-darker">
                Data de nascimento da mãe
              </label>
              <input
                id="nascimentoMae"
                name="nascimentoMae"
                inputMode="numeric"
                className={inputClass}
                placeholder="dd/mm/aaaa"
                value={values.nascimentoMae}
                onChange={(e) => update("nascimentoMae", maskDate(e.target.value))}
                aria-invalid={!!errors.nascimentoMae}
              />
              {errors.nascimentoMae && (
                <p className="mt-1 text-xs text-destructive">{errors.nascimentoMae}</p>
              )}
            </div>

            <label
              htmlFor="maeConstaDocumento"
              className="flex items-start gap-2.5 text-sm text-foreground"
            >
              <input
                id="maeConstaDocumento"
                name="maeConstaDocumento"
                type="checkbox"
                className="focus-gov mt-0.5 size-4 rounded border-border accent-primary"
                checked={values.maeConstaDocumento}
                onChange={(e) => update("maeConstaDocumento", e.target.checked)}
              />
              O nome da mãe consta no documento de identidade
            </label>

            <div>
              <label htmlFor="nomePai" className="text-sm font-semibold text-primary-darker">
                Nome completo do pai
              </label>
              <input
                id="nomePai"
                name="nomePai"
                maxLength={120}
                className={inputClass}
                placeholder="Como consta no documento"
                value={values.nomePai}
                onChange={(e) => update("nomePai", e.target.value)}
                aria-invalid={!!errors.nomePai}
              />
              {errors.nomePai && <p className="mt-1 text-xs text-destructive">{errors.nomePai}</p>}
            </div>

            <div>
              <label htmlFor="nascimentoPai" className="text-sm font-semibold text-primary-darker">
                Data de nascimento do pai
              </label>
              <input
                id="nascimentoPai"
                name="nascimentoPai"
                inputMode="numeric"
                className={inputClass}
                placeholder="dd/mm/aaaa"
                value={values.nascimentoPai}
                onChange={(e) => update("nascimentoPai", maskDate(e.target.value))}
                aria-invalid={!!errors.nascimentoPai}
              />
              {errors.nascimentoPai && (
                <p className="mt-1 text-xs text-destructive">{errors.nascimentoPai}</p>
              )}
            </div>

            <fieldset className="rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-bold text-primary-darker">
                Situação do processo
              </legend>

              <div>
                <label htmlFor="possuiRg" className="text-sm font-semibold text-primary-darker">
                  Você já possui RG (Registro Geral)?
                </label>
                <select
                  id="possuiRg"
                  name="possuiRg"
                  className={inputClass}
                  value={values.possuiRg}
                  onChange={(e) => update("possuiRg", e.target.value)}
                  aria-invalid={!!errors.possuiRg}
                >
                  <option value="">Selecione</option>
                  {SIM_NAO.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.possuiRg && (
                  <p className="mt-1 text-xs text-destructive">{errors.possuiRg}</p>
                )}
              </div>

              {values.possuiRg === "Sim" && (
                <>
                  <div className="mt-4">
                    <label
                      htmlFor="orgaoEmissorRg"
                      className="text-sm font-semibold text-primary-darker"
                    >
                      Órgão emissor do RG
                    </label>
                    <select
                      id="orgaoEmissorRg"
                      name="orgaoEmissorRg"
                      className={inputClass}
                      value={values.orgaoEmissorRg ?? ""}
                      onChange={(e) => update("orgaoEmissorRg", e.target.value)}
                      aria-invalid={!!errors.orgaoEmissorRg}
                    >
                      <option value="">Selecione</option>
                      {ORGAOS_RG.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    {errors.orgaoEmissorRg && (
                      <p className="mt-1 text-xs text-destructive">{errors.orgaoEmissorRg}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="ufRg" className="text-sm font-semibold text-primary-darker">
                      Estado em que o RG foi emitido
                    </label>
                    <select
                      id="ufRg"
                      name="ufRg"
                      className={inputClass}
                      value={values.ufRg ?? ""}
                      onChange={(e) => update("ufRg", e.target.value)}
                      aria-invalid={!!errors.ufRg}
                    >
                      <option value="">Selecione</option>
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                    {errors.ufRg && <p className="mt-1 text-xs text-destructive">{errors.ufRg}</p>}
                  </div>
                </>
              )}

              <div className="mt-4">
                <label
                  htmlFor="tipoSolicitacao"
                  className="text-sm font-semibold text-primary-darker"
                >
                  Tipo de solicitação
                </label>
                <select
                  id="tipoSolicitacao"
                  name="tipoSolicitacao"
                  className={inputClass}
                  value={values.tipoSolicitacao}
                  onChange={(e) => update("tipoSolicitacao", e.target.value)}
                  aria-invalid={!!errors.tipoSolicitacao}
                >
                  <option value="">Selecione</option>
                  {TIPOS_SOLICITACAO_LABELS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.tipoSolicitacao && (
                  <p className="mt-1 text-xs text-destructive">{errors.tipoSolicitacao}</p>
                )}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="cpfRegularizado"
                  className="text-sm font-semibold text-primary-darker"
                >
                  Seu CPF está regularizado (sem pendências na Receita Federal)?
                </label>
                <select
                  id="cpfRegularizado"
                  name="cpfRegularizado"
                  className={inputClass}
                  value={values.cpfRegularizado}
                  onChange={(e) => update("cpfRegularizado", e.target.value)}
                  aria-invalid={!!errors.cpfRegularizado}
                >
                  <option value="">Selecione</option>
                  {SIM_NAO_NAOSEI.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.cpfRegularizado && (
                  <p className="mt-1 text-xs text-destructive">{errors.cpfRegularizado}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="contaGovBr" className="text-sm font-semibold text-primary-darker">
                  Você já tem conta no gov.br nível Prata ou Ouro?
                </label>
                <select
                  id="contaGovBr"
                  name="contaGovBr"
                  className={inputClass}
                  value={values.contaGovBr}
                  onChange={(e) => update("contaGovBr", e.target.value)}
                  aria-invalid={!!errors.contaGovBr}
                >
                  <option value="">Selecione</option>
                  {SIM_NAO_NAOSEI.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.contaGovBr && (
                  <p className="mt-1 text-xs text-destructive">{errors.contaGovBr}</p>
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              className="focus-gov inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Continuar para o pagamento
              <ArrowRight className="size-4" aria-hidden />
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              Seus dados são usados apenas para emitir o acesso ao documento em PDF
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
