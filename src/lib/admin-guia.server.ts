import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { GUIA_BUCKET, GUIA_PATH } from "./guia.constants";

export type AdminSession = { unlocked?: boolean };

export function adminSession() {
  return useSession<AdminSession>({
    password: process.env["SESSION_SECRET"]!,
    name: "admin-guia",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  });
}

export function senhaConfere(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function infoArquivoGuia() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from(GUIA_BUCKET).list("", { search: GUIA_PATH });
  const arquivo = data?.find((f) => f.name === GUIA_PATH);
  if (!arquivo) return null;
  return {
    nome: arquivo.name,
    atualizadoEm: arquivo.updated_at ?? null,
    tamanho: (arquivo.metadata as { size?: number } | null)?.size ?? null,
  };
}

export async function salvarGuia(base64: string) {
  const bytes = Buffer.from(base64, "base64");
  if (bytes.subarray(0, 4).toString("utf8") !== "%PDF") {
    return { ok: false as const, erro: "O arquivo enviado não é um PDF válido." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage
    .from(GUIA_BUCKET)
    .upload(GUIA_PATH, bytes, { contentType: "application/pdf", upsert: true });

  if (error) {
    console.error("Falha ao subir guia:", error);
    return { ok: false as const, erro: "Falha ao enviar o arquivo. Tente novamente." };
  }
  return { ok: true as const };
}
