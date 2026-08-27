import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";

import { marcarEtapa } from "@/lib/funil.rastreio";
import type { EtapaFunil } from "@/lib/funil.constants";
import { TIPOS_SOLICITACAO, labelDoTipo } from "@/lib/solicitacao";
import { VALOR_GUIA, brl } from "@/lib/guia.constants";
import { PAISES, UFS } from "@/lib/paises";
import { cn } from "@/lib/utils";

const TOTAL_ETAPAS = 4;

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

/**
 * Filiação (nome da mãe e do pai) saiu daqui: é o dado mais característico do
 * requerimento da Polícia Federal e não tem nenhuma finalidade na venda de um
 * PDF — pedi-lo fazia a compra parecer uma solicitação de passaporte.
 */
type FormData = {
  tipoSolicitacao: string;
  nome: string;
  nascimento: string;
  situacaoCivil: string;
  paisNascimento: string;
  ufNascimento: string;
  cidadeNascimento: string;
  email: string;
  telefone: string;
  cpf: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const SITUACOES = ["Solteiro", "Casado", "Divorciado", "Viúvo", "União Estável"] as const;

const inputClass =
  "focus-gov w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground";

const selectClass = inputClass;

const labelClass = "block text-sm font-semibold text-primary-darker";

export function CheckoutForm() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [values, setValues] = useState<FormData>({
    tipoSolicitacao: "",
    nome: "",
    nascimento: "",
    situacaoCivil: "",
    paisNascimento: "Brasil",
    ufNascimento: "",
    cidadeNascimento: "",
    email: "",
    telefone: "",
    cpf: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const salvo = sessionStorage.getItem("formulario-checkout");
    if (salvo) {
      try {
        const dados = JSON.parse(salvo) as Partial<FormData>;
        setValues((prev) => ({ ...prev, ...dados }));
      } catch {
        //
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("formulario-checkout", JSON.stringify(values));
  }, [values]);

  function update(field: keyof FormData, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validarEtapa1(): boolean {
    const novoErro: Errors = {};
    if (!values.tipoSolicitacao) {
      novoErro.tipoSolicitacao = "Selecione uma opção";
    }
    setErrors(novoErro);
    return Object.keys(novoErro).length === 0;
  }

  function validarEtapa2(): boolean {
    const novoErro: Errors = {};

    if (!values.nome || values.nome.trim().length < 5) {
      novoErro.nome = "Informe seu nome completo";
    } else if (values.nome.split(/\s+/).length < 2) {
      novoErro.nome = "Informe nome e sobrenome";
    }

    if (!values.nascimento || !isValidBirthDate(values.nascimento)) {
      novoErro.nascimento = "Data inválida (dd/mm/aaaa)";
    }

    if (!values.situacaoCivil) {
      novoErro.situacaoCivil = "Selecione uma opção";
    }

    if (!values.paisNascimento) {
      novoErro.paisNascimento = "Selecione o país de nascimento";
    }

    if (!values.cidadeNascimento || values.cidadeNascimento.trim().length < 2) {
      novoErro.cidadeNascimento = "Informe a cidade de nascimento";
    }

    if (values.paisNascimento === "Brasil" && !values.ufNascimento) {
      novoErro.ufNascimento = "Selecione o estado";
    }

    setErrors(novoErro);
    return Object.keys(novoErro).length === 0;
  }

  function validarEtapa3(): boolean {
    const novoErro: Errors = {};

    if (!values.email || !values.email.includes("@")) {
      novoErro.email = "E-mail inválido";
    }

    if (!values.telefone || values.telefone.replace(/\D/g, "").length < 10) {
      novoErro.telefone = "Telefone inválido (DDD + número)";
    }

    if (!values.cpf || !isValidCPF(values.cpf)) {
      novoErro.cpf = "CPF inválido";
    }

    setErrors(novoErro);
    return Object.keys(novoErro).length === 0;
  }

  // Registra a etapa alcançada, inclusive a primeira ao abrir o formulário.
  useEffect(() => {
    if (etapa >= 1 && etapa <= TOTAL_ETAPAS) marcarEtapa(`form${etapa}` as EtapaFunil);
  }, [etapa]);

  function avancar() {
    let valido = false;
    if (etapa === 1) valido = validarEtapa1();
    if (etapa === 2) valido = validarEtapa2();
    if (etapa === 3) valido = validarEtapa3();

    if (valido && etapa < TOTAL_ETAPAS) {
      setEtapa(etapa + 1);
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function enviar() {
    if (!validarEtapa3()) {
      setEtapa(3);
      return;
    }

    sessionStorage.setItem("solicitacao-guia", JSON.stringify(values));
    sessionStorage.removeItem("formulario-checkout");
    void navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-screen bg-muted/40 pb-16">
      <div className="gov-stripe h-1" aria-hidden />
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-display text-2xl font-extrabold text-primary-darker">
              Comprar o guia
            </h1>
            <span className="text-sm font-semibold text-muted-foreground">
              Etapa {etapa} de {TOTAL_ETAPAS}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(etapa / TOTAL_ETAPAS) * 100}%` }}
              aria-valuenow={etapa}
              aria-valuemin={1}
              aria-valuemax={TOTAL_ETAPAS}
              role="progressbar"
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Você está comprando um guia informativo em PDF de uma empresa privada. Isto não é a
            solicitação do passaporte e não temos vínculo com a Polícia Federal.
          </p>
        </div>

        <form ref={formRef} className="space-y-6" noValidate>
          {/* ETAPA 1 — qual versão do guia interessa */}
          {etapa === 1 && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <div>
                <h2 className="font-display text-lg font-bold text-primary-darker">
                  Qual capítulo mais te interessa?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  O guia vem completo de qualquer forma — isso só nos ajuda a destacar a parte
                  mais útil para o seu caso.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TIPOS_SOLICITACAO.map((tipo) => {
                  const Icone = tipo.icon;
                  const selecionado = values.tipoSolicitacao === tipo.value;

                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => update("tipoSolicitacao", tipo.value)}
                      className={cn(
                        "focus-gov flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                        selecionado
                          ? "border-primary bg-primary-soft/20"
                          : "border-border hover:border-primary/60",
                      )}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-md",
                            selecionado
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary-soft text-primary",
                          )}
                        >
                          <Icone className="size-5" aria-hidden />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary-darker">{tipo.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{tipo.descricao}</p>
                      </div>
                      {selecionado && (
                        <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.tipoSolicitacao && (
                <p className="text-sm text-destructive">{errors.tipoSolicitacao}</p>
              )}
            </div>
          )}

          {/* ETAPA 2 */}
          {etapa === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-primary-darker">
                  Dados pessoais
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="nome" className={labelClass}>
                      Nome completo
                    </label>
                    <input
                      id="nome"
                      type="text"
                      maxLength={120}
                      className={cn(inputClass, "mt-1.5")}
                      placeholder="Nome e sobrenome"
                      value={values.nome}
                      onChange={(e) => update("nome", e.target.value)}
                      aria-invalid={!!errors.nome}
                    />
                    {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
                  </div>

                  <div>
                    <label htmlFor="nascimento" className={labelClass}>
                      Data de nascimento
                    </label>
                    <input
                      id="nascimento"
                      type="text"
                      inputMode="numeric"
                      className={cn(inputClass, "mt-1.5")}
                      placeholder="dd/mm/aaaa"
                      value={values.nascimento}
                      onChange={(e) => update("nascimento", maskDate(e.target.value))}
                      aria-invalid={!!errors.nascimento}
                    />
                    {errors.nascimento && (
                      <p className="mt-1 text-xs text-destructive">{errors.nascimento}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="situacaoCivil" className={labelClass}>
                      Estado civil
                    </label>
                    <select
                      id="situacaoCivil"
                      className={cn(selectClass, "mt-1.5")}
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
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-primary-darker">
                  Naturalidade
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="paisNascimento" className={labelClass}>
                      País de nascimento
                    </label>
                    <select
                      id="paisNascimento"
                      className={cn(selectClass, "mt-1.5")}
                      value={values.paisNascimento}
                      onChange={(e) => {
                        update("paisNascimento", e.target.value);
                        if (e.target.value !== "Brasil") {
                          update("ufNascimento", "");
                        }
                      }}
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

                  <div>
                    <label htmlFor="cidadeNascimento" className={labelClass}>
                      Cidade de nascimento
                    </label>
                    <input
                      id="cidadeNascimento"
                      type="text"
                      maxLength={120}
                      className={cn(inputClass, "mt-1.5")}
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
                    <div>
                      <label htmlFor="ufNascimento" className={labelClass}>
                        Estado (UF)
                      </label>
                      <select
                        id="ufNascimento"
                        className={cn(selectClass, "mt-1.5")}
                        value={values.ufNascimento ?? ""}
                        onChange={(e) => update("ufNascimento", e.target.value)}
                        aria-invalid={!!errors.ufNascimento}
                      >
                        <option value="">Selecione</option>
                        {UFS.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                      {errors.ufNascimento && (
                        <p className="mt-1 text-xs text-destructive">{errors.ufNascimento}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {etapa === 3 && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <div>
                <h2 className="font-display text-lg font-bold text-primary-darker">Contato</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usamos só para emitir o PIX e enviar o PDF. Nada aqui vai para a Polícia
                  Federal.
                </p>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  maxLength={255}
                  className={cn(inputClass, "mt-1.5")}
                  placeholder="seu@email.com"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  O guia em PDF será enviado para este e-mail
                </p>
              </div>

              <div>
                <label htmlFor="telefone" className={labelClass}>
                  WhatsApp
                </label>
                <input
                  id="telefone"
                  type="tel"
                  inputMode="tel"
                  className={cn(inputClass, "mt-1.5")}
                  placeholder="(11) 99999-0000"
                  value={values.telefone}
                  onChange={(e) => update("telefone", maskPhone(e.target.value))}
                  aria-invalid={!!errors.telefone}
                />
                {errors.telefone && (
                  <p className="mt-1 text-xs text-destructive">{errors.telefone}</p>
                )}
              </div>

              <div>
                <label htmlFor="cpf" className={labelClass}>
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  className={cn(inputClass, "mt-1.5")}
                  placeholder="000.000.000-00"
                  value={values.cpf}
                  onChange={(e) => update("cpf", maskCPF(e.target.value))}
                  aria-invalid={!!errors.cpf}
                />
                {errors.cpf && <p className="mt-1 text-xs text-destructive">{errors.cpf}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Exigido pelo processador de pagamento para emitir a cobrança PIX
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 4 — revisão */}
          {etapa === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-primary-darker">
                  Revisão do pedido
                </h2>

                <div className="space-y-6">
                  <div className="border-b border-border pb-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-primary-darker">Produto</h3>
                      <button
                        type="button"
                        onClick={() => setEtapa(1)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                    <p className="text-sm text-foreground">
                      Guia do Passaporte (PDF)
                      {values.tipoSolicitacao && ` — ${labelDoTipo(values.tipoSolicitacao)}`}
                    </p>
                  </div>

                  <div className="border-b border-border pb-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-primary-darker">Dados pessoais</h3>
                      <button
                        type="button"
                        onClick={() => setEtapa(2)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                    <dl className="grid gap-3 text-sm">
                      <div>
                        <dt className="font-medium text-muted-foreground">Nome</dt>
                        <dd className="text-foreground">{values.nome}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">Data de nascimento</dt>
                        <dd className="text-foreground">{values.nascimento}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">Estado civil</dt>
                        <dd className="text-foreground">{values.situacaoCivil}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">Naturalidade</dt>
                        <dd className="text-foreground">
                          {values.cidadeNascimento}, {values.ufNascimento || values.paisNascimento}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-primary-darker">Contato</h3>
                      <button
                        type="button"
                        onClick={() => setEtapa(3)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                    <dl className="grid gap-3 text-sm">
                      <div>
                        <dt className="font-medium text-muted-foreground">E-mail de entrega</dt>
                        <dd className="break-all text-foreground">{values.email}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">WhatsApp</dt>
                        <dd className="text-foreground">{values.telefone}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">CPF</dt>
                        <dd className="text-foreground">{values.cpf}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-primary bg-primary-soft/40 p-6">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-primary-dark">Guia do Passaporte (PDF)</dt>
                    <dd className="font-display text-2xl font-extrabold text-primary-darker">
                      {brl(VALOR_GUIA)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-primary/20 pt-2 text-muted-foreground">
                    <dt>Taxa oficial do passaporte (GRU)</dt>
                    <dd className="font-semibold">não cobrada aqui</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Pagamento único via PIX pelo guia. A taxa do passaporte é paga por você
                  diretamente à Polícia Federal, em guia emitida no site oficial.
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            {etapa > 1 && (
              <button
                type="button"
                onClick={voltar}
                className="focus-gov inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Voltar
              </button>
            )}

            {etapa < TOTAL_ETAPAS ? (
              <button
                type="button"
                onClick={avancar}
                className="focus-gov ml-auto inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Avançar
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={enviar}
                className="focus-gov ml-auto inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Ir para pagamento
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Seus dados são criptografados e usados apenas para cobrar e entregar o guia
          </p>
        </form>
      </div>
    </div>
  );
}
