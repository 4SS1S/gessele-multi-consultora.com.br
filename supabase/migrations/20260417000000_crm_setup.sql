-- ================================================
-- CRM — Supabase-specific setup
-- ================================================
-- ATENÇÃO: A tabela `profiles` e o enum `Role` são gerenciados pelo Prisma.
-- Execute `pnpm prisma migrate deploy` antes deste script.
-- Este arquivo adiciona apenas o que o Prisma não gerencia:
--   1. FK para auth.users
--   2. RLS policies
--   3. Trigger de criação automática de perfil
-- ================================================

-- 1. FK para auth.users (Prisma não atravessa schemas diferentes)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Usuário vê o próprio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Administrador vê todos os perfis
CREATE POLICY "profiles_select_all_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'administrador'
    )
  );

-- Usuário atualiza o próprio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Administrador atualiza qualquer perfil (inclusive role)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'administrador'
    )
  );

-- Trigger pode inserir (criação de perfil no signup)
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Administrador deleta perfis
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'administrador'
    )
  );

-- 4. Função + trigger: cria perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'comprador')::"Role"
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
