-- ================================================
-- Produtos — RLS + Supabase Storage
-- ================================================
-- Execute após: pnpm prisma migrate deploy
-- ================================================

-- 1. RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler produtos
CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Consultora só vê e gerencia os próprios produtos
CREATE POLICY "products_insert_own"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = consultora_id);

CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE
  USING (auth.uid() = consultora_id)
  WITH CHECK (auth.uid() = consultora_id);

CREATE POLICY "products_delete_own"
  ON public.products FOR DELETE
  USING (auth.uid() = consultora_id);

-- Administrador gerencia todos os produtos
CREATE POLICY "products_all_admin"
  ON public.products
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'administrador'
    )
  );

-- ================================================
-- 2. Supabase Storage — bucket product-images (público)
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (qualquer um pode ver as imagens)
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Consultora faz upload na própria pasta: {user_id}/...
CREATE POLICY "product_images_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Consultora atualiza (upsert) as próprias imagens
CREATE POLICY "product_images_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Consultora deleta as próprias imagens
CREATE POLICY "product_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
