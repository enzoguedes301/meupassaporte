import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const entrarAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ senha: z.string().max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { adminSession, senhaConfere } = await import("./admin-guia.server");
    const expected = process.env["ADMIN_UPLOAD_PASSWORD"];
    if (!expected) throw new Error("ADMIN_UPLOAD_PASSWORD não configurada");
    if (!senhaConfere(data.senha, expected)) return { ok: false as const };
    const session = await adminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const statusAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { adminSession, infoArquivoGuia } = await import("./admin-guia.server");
  const session = await adminSession();
  if (!session.data.unlocked) return { unlocked: false as const, arquivo: null };
  return { unlocked: true as const, arquivo: await infoArquivoGuia() };
});

export const enviarGuia = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ base64: z.string().min(100).max(40_000_000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { adminSession, salvarGuia } = await import("./admin-guia.server");
    const session = await adminSession();
    if (!session.data.unlocked) throw new Error("Não autorizado");
    return salvarGuia(data.base64);
  });

export const sairAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { adminSession } = await import("./admin-guia.server");
  const session = await adminSession();
  await session.clear();
  return { ok: true as const };
});
