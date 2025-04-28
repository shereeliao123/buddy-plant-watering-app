/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies for users table
    - Create new policies that properly handle user creation and updates
    
  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Creating user row (only for authenticated users creating their own row)
      - Updating user data (only for authenticated users updating their own data)
      - Viewing user data (only for authenticated users viewing their own data)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own row" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Recreate policies with correct permissions
CREATE POLICY "Users can create their own row"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);