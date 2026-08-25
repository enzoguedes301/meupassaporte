-- Explicit deny-by-default posture for the private 'guias-pdf' bucket.
-- Only the service role (server-side code) may touch these objects.

DROP POLICY IF EXISTS "guias_pdf_service_role_select" ON storage.objects;
DROP POLICY IF EXISTS "guias_pdf_service_role_insert" ON storage.objects;
DROP POLICY IF EXISTS "guias_pdf_service_role_update" ON storage.objects;
DROP POLICY IF EXISTS "guias_pdf_service_role_delete" ON storage.objects;

CREATE POLICY "guias_pdf_service_role_select"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'guias-pdf');

CREATE POLICY "guias_pdf_service_role_insert"
ON storage.objects FOR INSERT TO service_role
WITH CHECK (bucket_id = 'guias-pdf');

CREATE POLICY "guias_pdf_service_role_update"
ON storage.objects FOR UPDATE TO service_role
USING (bucket_id = 'guias-pdf')
WITH CHECK (bucket_id = 'guias-pdf');

CREATE POLICY "guias_pdf_service_role_delete"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'guias-pdf');