/*
  # Fix notifications system

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users id
      - `notifications_enabled` (boolean) - user's notification preference
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on users table
    - Add policies for users to manage their own notification preferences
    - Add trigger for updated_at
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  notifications_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preference(enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, notifications_enabled)
  VALUES (auth.uid(), enabled)
  ON CONFLICT (id) DO UPDATE
  SET notifications_enabled = EXCLUDED.notifications_enabled,
      updated_at = now();
END;
$$;