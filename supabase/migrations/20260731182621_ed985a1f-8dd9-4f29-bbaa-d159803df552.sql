ALTER TABLE public.pedidos
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS stripe_customer_id;