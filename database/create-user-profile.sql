-- First, let's check if the trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- If the trigger doesn't exist, create it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now manually create a user profile for the existing user
-- Replace '88f4c022-2d0c-4ae5-be4e-0cc8d7b87f37' with your actual user ID
INSERT INTO user_profiles (id, email, first_name, last_name, role)
VALUES (
  '88f4c022-2d0c-4ae5-be4e-0cc8d7b87f37',
  'your-email@example.com', -- Replace with your actual email
  'John', -- Replace with your first name
  'Doe',  -- Replace with your last name
  'user'
) ON CONFLICT (id) DO NOTHING; 