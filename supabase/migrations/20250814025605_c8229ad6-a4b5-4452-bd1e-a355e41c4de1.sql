-- Create table for import logs and tracking
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  total_products INTEGER NOT NULL DEFAULT 0,
  processed_products INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  error_log JSONB DEFAULT '[]'::jsonb,
  success_log JSONB DEFAULT '[]'::jsonb,
  mapping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for import logs
CREATE POLICY "Users can view their own import logs" 
ON public.import_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import logs" 
ON public.import_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import logs" 
ON public.import_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_import_logs_updated_at
BEFORE UPDATE ON public.import_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_import_logs_user_id ON public.import_logs(user_id);
CREATE INDEX idx_import_logs_status ON public.import_logs(status);
CREATE INDEX idx_import_logs_created_at ON public.import_logs(created_at DESC);