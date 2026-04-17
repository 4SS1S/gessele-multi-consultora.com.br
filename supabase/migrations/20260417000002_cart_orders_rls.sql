-- ================================================
-- Carrinho e Pedidos — RLS
-- ================================================
-- Execute após: pnpm prisma migrate deploy
-- ================================================

-- ── Carrinho ─────────────────────────────────────────────────────────────────

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_own"
  ON public.carts
  USING (auth.uid() = comprador_id);

-- ── Itens do carrinho ─────────────────────────────────────────────────────────

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_own"
  ON public.cart_items
  USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.comprador_id = auth.uid())
  );

-- ── Pedidos ───────────────────────────────────────────────────────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Comprador vê os próprios pedidos
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = comprador_id);

-- Consultora vê pedidos que contêm produtos dela
CREATE POLICY "orders_select_consultora"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.consultora_id = auth.uid()
    )
  );

-- Admin vê todos
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

-- Apenas o sistema (service role) cria pedidos via checkout
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = comprador_id);

-- Admin atualiza status
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  );

-- Consultora atualiza status dos pedidos com produtos dela
CREATE POLICY "orders_update_consultora"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.consultora_id = auth.uid()
    )
  );

-- ── Itens de pedido ───────────────────────────────────────────────────────────

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Comprador vê os itens dos próprios pedidos
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.comprador_id = auth.uid())
  );

-- Consultora vê itens dos produtos dela
CREATE POLICY "order_items_select_consultora"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = product_id AND p.consultora_id = auth.uid()
    )
  );

-- Admin vê tudo
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
