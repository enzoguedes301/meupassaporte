CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL,
  nascimento TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  amount_total INTEGER,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  environment TEXT NOT NULL DEFAULT 'sandbox',
  guia_enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente o servidor gerencia pedidos"
  ON public.pedidos FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_pedidos_email ON public.pedidos(email);