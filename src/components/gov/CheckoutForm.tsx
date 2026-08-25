import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
} from "lucide-react";

import { TIPOS_SOLICITACAO, labelDoTipo } from "@/lib/solicitacao";
import { PAISES, UFS } from "@/lib/paises";
import { cn } from "@/lib/utils";

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

type FormData = {
  tipoSolicitacao: string;
  nome: string;
  nascimento: string;
  situacaoCivil: string;
  nomeMae: string;
  nomePai: string;
  paiNaoConsta: boolean;
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
    nomeMae: "",
    nomePai: "",
    paiNaoConsta: false,
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

  function update(field: keyof FormData, value: string | boolean) {
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

    if (!values.nomeMae || values.nomeMae.trim().length < 5) {
      novoErro.nomeMae = "Informe o nome completo da mãe";
    } else if (values.nomeMae.split(/\s+/).length < 2) {
      novoErro.nomeMae = "Informe nome e sobrenome";
    }

    if (!values.paiNaoConsta) {
      if (!values.nomePai || values.nomePai.trim().length < 5) {
        novoErro.nomePai = "Informe o nome do pai ou marque 'não consta'";
      } else if (values.nomePai.split(/\s+/).length < 2) {
        novoErro.nomePai = "Informe nome e sobrenome";
      }
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

  function avancar() {
    let valido = false;
    if (etapa === 1) valido = validarEtapa1();
    if (etapa === 2) valido = validarEtapa2();
    if (etapa === 3) valido = validarEtapa3();

    if (valido && etapa < 4) {
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
    if (!validarEtapa3()) return;

    const dadosParaCheckout = {
      tipoSolicitacao: values.tipoSolicitacao,
      nome: values.nome,
      nascimento: values.nascimento,
      situacaoCivil: values.situacaoCivil,
      nomeMae: values.nomeMae,
      nomePai: values.paiNaoConsta ? "Não consta" : values.nomePai,
      paisNascimento: values.paisNascimento,
      ufNascimento: values.ufNascimento,
      cidadeNascimento: values.cidadeNascimento,
      email: values.email,
      telefone: values.telefone,
      cpf: values.cpf,
    };

    sessionStorage.setItem("solicitacao-guia", JSON.stringify(dadosParaCheckout));
    sessionStorage.removeItem("formulario-checkout");
    void navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-screen bg-muted/40 pb-16">
      <div className="gov-stripe h-1" aria-hidden />
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-display text-2xl font-extrabold text-primary-darker">
              Dados do pedido
            </h1>
            <span className="text-sm font-semibold text-muted-foreground">
              Etapa {etapa} de 4 ({Math.round((etapa / 4) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(etapa / 4) * 100}%` }}
              aria-valuenow={etapa}
              aria-valuemin={1}
              aria-valuemax={4}
              role="progressbar"
            />
          </div>
        </div>

        <form ref={formRef} className="space-y-6" noValidate>
          {/* ETAPA 1 */}
          {etapa === 1 && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-primary-darker">
                  Qual é seu caso?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione o tipo de solicitação que melhor descreve sua situação.
                </p>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
                            "flex items-center justify-center size-10 rounded-md",
                            selecionado ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
                          )}
                        >
                          <Icone className="size-5" aria-hidden />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary-darker">{tipo.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{tipo.descricao}</p>
                      </div>
                      {selecionado && (
                        <Check className="size-5 text-primary shrink-0 mt-1" aria-hidden />
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
                <h2 className="font-display text-lg font-bold text-primary-darker mb-4">
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
                      placeholder="Como consta no documento"
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

                  <div>
                    <label htmlFor="nomeMae" className={labelClass}>
                      Nome completo da mãe
                    </label>
                    <input
                      id="nomeMae"
                      type="text"
                      maxLength={120}
                      className={cn(inputClass, "mt-1.5")}
                      placeholder="Como consta no documento"
                      value={values.nomeMae}
                      onChange={(e) => update("nomeMae", e.target.value)}
                      aria-invalid={!!errors.nomeMae}
                    />
                    {errors.nomeMae && (
                      <p className="mt-1 text-xs text-destructive">{errors.nomeMae}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="nomePai" className={labelClass}>
                      Nome completo do pai
                    </label>
                    <input
                      id="nomePai"
                      type="text"
                      maxLength={120}
                      className={cn(inputClass, "mt-1.5")}
                      placeholder="Como consta no documento"
                      value={values.nomePai}
                      onChange={(e) => update("nomePai", e.target.value)}
                      disabled={values.paiNaoConsta}
                      aria-invalid={!!errors.nomePai}
                    />
                    {errors.nomePai && (
                      <p className="mt-1 text-xs text-destructive">{errors.nomePai}</p>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="focus-gov mt-1 size-4 rounded border-border accent-primary"
                      checked={values.paiNaoConsta}
                      onChange={(e) => {
                        update("paiNaoConsta", e.target.checked);
                        if (e.target.checked) {
                          update("nomePai", "Não consta");
                        } else {
                          update("nomePai", "");
                        }
                      }}
                    />
                    <span>Pai não consta no documento</span>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold text-primary-darker mb-4">
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
                      <p className="mt-1 text-xs text-destructive">
                        {errors.cidadeNascimento}
                      </p>
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
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-primary-darker">Contato</h2>

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
                <p className="mt-1 text-xs text-muted-foreground">O guia será enviado para este e-mail</p>
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
              </div>
            </div>
          )}

          {/* ETAPA 4 */}
          {etapa === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold text-primary-darker mb-4">
                  Revisão dos dados
                </h2>

                <div className="space-y-6">
                  <div className="pb-6 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-primary-darker">Tipo de solicitação</h3>
                      <button
                        type="button"
                        onClick={() => setEtapa(1)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                    <p className="text-sm text-foreground">
                      {labelDoTipo(values.tipoSolicitacao)}
                    </p>
                  </div>

                  <div className="pb-6 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
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
                        <dt className="font-medium text-muted-foreground">Mãe</dt>
                        <dd className="text-foreground">{values.nomeMae}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">Pai</dt>
                        <dd className="text-foreground">
                          {values.paiNaoConsta ? "Não consta no documento" : values.nomePai}
                        </dd>
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
                    <div className="flex items-start justify-between mb-3">
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
                        <dt className="font-medium text-muted-foreground">E-mail</dt>
                        <dd className="text-foreground break-all">{values.email}</dd>
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

              <div className="rounded-lg border-2 border-primary bg-primary-soft/40 p-6 text-center">
                <p className="text-sm font-medium text-primary-dark">Valor total</p>
                <p className="font-display text-3xl font-extrabold text-primary-darker mt-2">
                  R$ 239,90
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Pagamento único via PIX</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            {etapa > 1 && (
              <button
                type="button"
                onClick={voltar}
                className="focus-gov inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Voltar
              </button>
            )}

            {etapa < 4 && (
              <button
                type="button"
                onClick={avancar}
                className="focus-gov ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Avançar
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}

            {etapa === 4 && (
              <button
                type="button"
                onClick={enviar}
                className="focus-gov ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Ir para pagamento
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Seus dados são criptografados e usados apenas para emitir o acesso ao guia
          </p>
        </form>
      </div>
    </div>
  );
}
