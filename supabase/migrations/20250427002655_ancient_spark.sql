/*
  # Add notifications enabled column to auth.users

  1. Changes
    - Add notifications_enabled column to auth.users table with default value true
    - Add RLS policy to allow users to read and update their own notification settings
*/

ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;

CREATE POLICY "Users can read own notification settings"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own notification settings"
  ON auth.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);