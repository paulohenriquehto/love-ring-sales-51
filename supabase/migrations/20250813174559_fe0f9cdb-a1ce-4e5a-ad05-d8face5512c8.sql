-- Configure admin user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'paulohenriquehto28@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- User exists, update their profile to admin
        UPDATE public.profiles 
        SET role = 'admin', updated_at = now()
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'User profile updated to admin role';
    ELSE
        RAISE NOTICE 'User not found. They need to register first, then their role will be automatically set to admin';
    END IF;
END $$;

-- Create function to automatically set admin role for specific email
CREATE OR REPLACE FUNCTION public.set_admin_role_for_specific_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Check if the new user has the admin email
    IF NEW.email = 'paulohenriquehto28@gmail.com' THEN
        -- Update the profile that was just created to admin role
        UPDATE public.profiles 
        SET role = 'admin' 
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically promote the admin email
DROP TRIGGER IF EXISTS set_admin_role_trigger ON auth.users;
CREATE TRIGGER set_admin_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.set_admin_role_for_specific_email();