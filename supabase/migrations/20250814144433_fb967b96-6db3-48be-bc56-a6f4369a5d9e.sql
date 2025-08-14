-- Create webhook_deliveries table for tracking webhook delivery attempts
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  payload JSONB,
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_deliveries
CREATE POLICY "Admin can view webhook deliveries" 
ON public.webhook_deliveries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create indexes for performance
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_event ON public.webhook_deliveries(event);
CREATE INDEX idx_webhook_deliveries_delivered_at ON public.webhook_deliveries(delivered_at DESC);
CREATE INDEX idx_webhook_deliveries_success ON public.webhook_deliveries(success);

-- Create function to automatically trigger webhooks on order events
CREATE OR REPLACE FUNCTION public.trigger_order_webhooks()
RETURNS TRIGGER AS $$
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

  -- Call webhook delivery function asynchronously
  PERFORM net.http_post(
    url := (SELECT CONCAT(current_setting('app.supabase_url'), '/functions/v1/webhook-delivery')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('app.supabase_service_role_key'))
    ),
    body := jsonb_build_object(
      'event', event_name,
      'data', webhook_payload,
      'source', 'database_trigger'
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for order events
CREATE TRIGGER trigger_order_created_webhook
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_order_webhooks();

CREATE TRIGGER trigger_order_updated_webhook
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_order_webhooks();

-- Add trigger for timestamp updates
CREATE TRIGGER update_webhook_deliveries_updated_at
  BEFORE UPDATE ON public.webhook_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();