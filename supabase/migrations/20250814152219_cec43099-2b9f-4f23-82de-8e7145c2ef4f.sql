-- Add DELETE policy for products table
CREATE POLICY "Admins and managers can delete products"
ON public.products
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'manager')
));

-- Function to validate if product can be deleted (not in any orders)
CREATE OR REPLACE FUNCTION public.can_delete_product(product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if product exists in any order items
  IF EXISTS (
    SELECT 1 FROM public.order_items 
    WHERE order_items.product_id = can_delete_product.product_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to delete product with cascading deletion
CREATE OR REPLACE FUNCTION public.delete_product_cascade(product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First check if product can be deleted
  IF NOT public.can_delete_product(product_id) THEN
    RAISE EXCEPTION 'Cannot delete product: it exists in order history';
  END IF;
  
  -- Log the deletion
  PERFORM public.log_audit_event(
    'delete',
    'product',
    product_id,
    jsonb_build_object('action', 'physical_delete'),
    'warning'
  );
  
  -- Delete in cascade order to maintain referential integrity
  -- 1. Delete inventory records
  DELETE FROM public.inventory WHERE inventory.product_id = delete_product_cascade.product_id;
  
  -- 2. Delete product images
  DELETE FROM public.product_images WHERE product_images.product_id = delete_product_cascade.product_id;
  
  -- 3. Delete engraving configuration
  DELETE FROM public.product_engraving_config WHERE product_engraving_config.product_id = delete_product_cascade.product_id;
  
  -- 4. Delete product variants
  DELETE FROM public.product_variants WHERE product_variants.product_id = delete_product_cascade.product_id;
  
  -- 5. Finally delete the product
  DELETE FROM public.products WHERE products.id = delete_product_cascade.product_id;
  
  RETURN TRUE;
END;
$$;