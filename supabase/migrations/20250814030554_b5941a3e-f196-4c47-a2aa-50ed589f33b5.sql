-- Add missing RLS policies for request_items table
CREATE POLICY "Users can create request items for their own requests"
ON public.request_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.requests 
    WHERE requests.id = request_items.request_id 
    AND requests.requester_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update request items for their own requests"
ON public.request_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.requests 
    WHERE requests.id = request_items.request_id 
    AND requests.requester_user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete request items for their own requests"
ON public.request_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.requests 
    WHERE requests.id = request_items.request_id 
    AND requests.requester_user_id = auth.uid()
  )
);

CREATE POLICY "Admins and managers can manage all request items"
ON public.request_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);