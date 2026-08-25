ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS gateway text NOT NULL DEFAULT 'sigilopay',
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS identifier text,
  ADD COLUMN IF NOT EXISTS pix_code text,
  ADD COLUMN IF NOT EXISTS pix_image text;

CREATE INDEX IF NOT EXISTS pedidos_transaction_id_idx ON public.pedidos (transaction_id);
CREATE UNIQUE INDEX IF NOT EXISTS pedidos_identifier_key ON public.pedidos (identifier);