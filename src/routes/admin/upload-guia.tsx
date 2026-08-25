import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, FileUp, Loader2, Lock } from "lucide-react";

import { GovHeader } from "@/components/gov/Header";
import { GovFooter } from "@/components/gov/Footer";
import { entrarAdmin, enviarGuia, statusAdmin } from "@/lib/admin-guia.functions";

export const Route = createFileRoute("/admin/upload-guia")({
  ssr: false,
  component: UploadGuia,
  head: () => ({
    meta: [
      { title: "Upload do Guia — Área restrita" },
      { name: "description", content: "Área restrita para envio do PDF do Guia do Primeiro Passaporte." },
      { property: "og:title", content: "Upload do Guia — Área restrita" },
      { property: "og:description", content: "Área restrita para envio do PDF do guia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Arquivo = { nome: string; atualizadoEm: string | null; tamanho: number | null } | null;

function UploadGuia() {
  const entrar = useServerFn(entrarAdmin);
  const status = useServerFn(statusAdmin);
  const enviar = useServerFn(enviarGuia);

  const [carregando, setCarregando] = useState(true);
  const [liberado, setLiberado] = useState(false);
  const [arquivo, setArquivo] = useState<Arquivo>(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function atualizar() {
    const r = await status({});
    setLiberado(r.unlocked);
    setArquivo(r.unlocked ? (r.arquivo ?? null) : null);
  }

  useEffect(() => {
    void (async () => {
      try {
        await atualizar();
      } finally {
        setCarregando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onEntrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const r = await entrar({ data: { senha } });
    if (!r.ok) {
      setErro("Senha incorreta.");
      return;
    }
    setSenha("");
    await atualizar();
  }

  async function onUpload(file: File) {
    setErro("");
    setSucesso(false);
    setEnviando(true);
    try {
      const buffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      const r = await enviar({ data: { base64: btoa(binary) } });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      setSucesso(true);
      await atualizar();
    } catch (err) {
      console.error(err);
      setErro("Não foi possível enviar o arquivo.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <GovHeader />
      <main className="min-h-screen bg-muted/40 pb-16">
        <div className="gov-stripe h-1" aria-hidden />
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <h1 className="font-display text-2xl font-extrabold text-primary-darker sm:text-3xl">
            Upload do Guia (área restrita)
          </h1>

          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            {carregando && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando…
              </div>
            )}

            {!carregando && !liberado && (
              <form onSubmit={onEntrar} className="space-y-4">
                <p className="flex items-center gap-2 font-semibold text-primary-darker">
                  <Lock className="size-4" aria-hidden /> Acesso restrito
                </p>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha de administrador"
                  autoComplete="current-password"
                  className="focus-gov w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                {erro && <p className="text-sm text-destructive">{erro}</p>}
                <button
                  type="submit"
                  className="focus-gov inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
                >
                  Entrar
                </button>
              </form>
            )}

            {!carregando && liberado && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Envie o PDF do guia. Ele será salvo como{" "}
                  <strong>guia-primeiro-passaporte.pdf</strong> e enviado automaticamente aos
                  compradores.
                </p>

                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                  {arquivo ? (
                    <>
                      Arquivo atual: <strong>{arquivo.nome}</strong>
                      {arquivo.tamanho ? ` — ${(arquivo.tamanho / 1024 / 1024).toFixed(2)} MB` : ""}
                      {arquivo.atualizadoEm
                        ? ` — atualizado em ${new Date(arquivo.atualizadoEm).toLocaleString("pt-BR")}`
                        : ""}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Nenhum arquivo enviado ainda.</span>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  disabled={enviando}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onUpload(file);
                  }}
                  className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                />

                {enviando && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> Enviando arquivo…
                  </p>
                )}
                {sucesso && (
                  <p className="flex items-center gap-2 text-sm text-primary">
                    <Check className="size-4" aria-hidden /> Guia enviado com sucesso.
                  </p>
                )}
                {erro && <p className="text-sm text-destructive">{erro}</p>}

                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileUp className="size-3.5" aria-hidden /> Apenas arquivos PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <GovFooter />
    </>
  );
}
