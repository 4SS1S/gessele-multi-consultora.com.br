-- ============================================================
-- SUPABASE SETUP — script combinado e idempotente
-- Pode ser executado mais de uma vez sem erros.
-- ============================================================
-- Pré-requisito: tabelas criadas pelo Prisma
--   pnpm prisma migrate deploy
-- ============================================================

-- ── 0. Extensão uuid (precaução) ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES — FK + RLS + trigger
-- ============================================================

-- FK para auth.users
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recria as policies de forma idempotente
DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"       ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_trigger"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"     ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_all_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

-- Trigger: cria perfil automaticamente no cadastro (captura dados sociais)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'comprador')::"Role"
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS — RLS
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
DROP POLICY IF EXISTS "products_insert_own"           ON public.products;
DROP POLICY IF EXISTS "products_update_own"           ON public.products;
DROP POLICY IF EXISTS "products_delete_own"           ON public.products;
DROP POLICY IF EXISTS "products_all_admin"            ON public.products;

CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

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

CREATE POLICY "products_all_admin"
  ON public.products
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

-- ============================================================
-- 3. CARRINHO E PEDIDOS — RLS
-- ============================================================

-- Carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_own" ON public.carts;

CREATE POLICY "carts_own"
  ON public.carts
  USING (auth.uid() = comprador_id);

-- Cart items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;

CREATE POLICY "cart_items_own"
  ON public.cart_items
  USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.comprador_id = auth.uid())
  );

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own"        ON public.orders;
DROP POLICY IF EXISTS "orders_select_consultora" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin"      ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"        ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin"      ON public.orders;
DROP POLICY IF EXISTS "orders_update_consultora" ON public.orders;

CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = comprador_id);

CREATE POLICY "orders_select_consultora"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.consultora_id = auth.uid()
    )
  );

CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = comprador_id);

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

CREATE POLICY "orders_update_consultora"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.consultora_id = auth.uid()
    )
  );

-- Order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own"        ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_consultora" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_admin"      ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own"        ON public.order_items;

CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.comprador_id = auth.uid())
  );

CREATE POLICY "order_items_select_consultora"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.consultora_id = auth.uid())
  );

CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

CREATE POLICY "order_items_insert_own"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.comprador_id = auth.uid())
  );

-- ============================================================
-- 4. STORAGE — buckets + policies
-- ============================================================

-- Bucket: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_own"  ON storage.objects;

CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "product_images_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "product_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bucket: avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own"   ON storage.objects;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
