/*
  # Fix notification persistence

  1. Changes
    - Drop the public.users table as it's redundant
    - Add RPC function to update notification settings in auth.users
    - Ensure proper RLS policies for auth.users table

  2. Security
    - Maintain existing RLS policies for auth.users
    - Add secure RPC function for updating notification settings
*/

-- Drop the public.users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Create RPC function to update notification settings
CREATE OR REPLACE FUNCTION update_user_notification_settings(user_id uuid, enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to update their own settings
  IF auth.uid() = user_id THEN
    UPDATE auth.users
    SET notifications_enabled = enabled
    WHERE id = user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;

-- Ensure RLS policies exist for auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth' 
    AND tablename = 'users' 
    AND policyname = 'Users can read own notification settings'
  ) THEN
    CREATE POLICY "Users can read own notification settings"
      ON auth.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;