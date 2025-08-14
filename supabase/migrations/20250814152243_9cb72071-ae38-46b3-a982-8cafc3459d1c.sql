-- Fix search path security warnings for existing functions
ALTER FUNCTION public.can_delete_product(UUID) SET search_path = 'public';
ALTER FUNCTION public.delete_product_cascade(UUID) SET search_path = 'public';
ALTER FUNCTION public.log_audit_event(text, text, uuid, jsonb, text) SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';