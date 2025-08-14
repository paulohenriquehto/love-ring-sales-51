-- Add missing RLS policies for requests table to allow users to update and delete their own requests

-- Allow users to update their own requests (only if status allows editing)
CREATE POLICY "Users can update own requests in editable status" 
ON public.requests 
FOR UPDATE 
USING (
  requester_user_id = auth.uid() 
  AND status IN ('draft', 'rejected')
);

-- Allow users to delete their own requests (only if status is draft)
CREATE POLICY "Users can delete own draft requests" 
ON public.requests 
FOR DELETE 
USING (
  requester_user_id = auth.uid() 
  AND status = 'draft'
);