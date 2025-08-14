-- Add payment information columns to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method text CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash')),
ADD COLUMN installments integer DEFAULT 1 CHECK (installments >= 1 AND installments <= 12),
ADD COLUMN installment_value numeric DEFAULT 0;