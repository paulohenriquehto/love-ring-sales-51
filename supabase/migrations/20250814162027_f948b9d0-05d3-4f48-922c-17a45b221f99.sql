-- FASE 1: Correção Imediata - Desabilitar triggers problemáticos e habilitar extensão HTTP

-- Primeiro, tentar habilitar a extensão pgsql-http
CREATE EXTENSION IF NOT EXISTS http;

-- Se a extensão não estiver disponível, vamos criar uma versão alternativa da função
-- que não depende da extensão net
CREATE OR REPLACE FUNCTION public.trigger_order_webhooks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  event_name TEXT;
  webhook_payload JSONB;
BEGIN
  -- Determine event name based on trigger
  IF TG_OP = 'INSERT' THEN
    event_name := 'order.created';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    event_name := 'order.updated';
    IF NEW.status = 'completed' THEN
      event_name := 'order.completed';
    ELSIF NEW.status = 'cancelled' THEN
      event_name := 'order.cancelled';
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Prepare webhook payload
  webhook_payload := jsonb_build_object(
    'order_id', COALESCE(NEW.id, OLD.id),
    'order_number', COALESCE(NEW.order_number, OLD.order_number),
    'status', COALESCE(NEW.status, OLD.status),
    'total', COALESCE(NEW.total, OLD.total),
    'customer_email', COALESCE(NEW.customer_email, OLD.customer_email),
    'event_timestamp', now()
  );

  -- Log webhook event instead of trying to call HTTP directly
  -- This prevents the "net schema does not exist" error
  INSERT INTO audit_logs (
    action,
    resource_type,
    resource_id,
    details,
    severity
  ) VALUES (
    'webhook_event',
    'order',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'event', event_name,
      'webhook_payload', webhook_payload,
      'note', 'Webhook event logged - HTTP extension not available'
    ),
    'info'
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Verificar se existem triggers ativos e recriá-los se necessário
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS trigger_order_created_webhook ON public.orders;
  DROP TRIGGER IF EXISTS trigger_order_updated_webhook ON public.orders;
  
  -- Create new triggers with the updated function
  CREATE TRIGGER trigger_order_created_webhook
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_order_webhooks();
    
  CREATE TRIGGER trigger_order_updated_webhook
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_order_webhooks();
    
  RAISE NOTICE 'Triggers recriados com função corrigida';
END $$;