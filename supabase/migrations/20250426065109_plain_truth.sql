/*
  # Plant Watering Tracker Schema

  1. New Tables
    - `plants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `species` (text)
      - `location` (text)
      - `watering_frequency_days` (integer)
      - `last_watered_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `watering_history`
      - `id` (uuid, primary key)
      - `plant_id` (uuid, references plants)
      - `watered_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own plants and watering history
      - Create new plants and watering records
      - Update their own plants
      - Delete their own plants (cascades to watering history)
*/

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  species text NOT NULL,
  location text NOT NULL CHECK (location IN ('Indoor', 'Outdoor')),
  watering_frequency_days integer NOT NULL CHECK (watering_frequency_days > 0),
  last_watered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watering history table
CREATE TABLE IF NOT EXISTS watering_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  watered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_history ENABLE ROW LEVEL SECURITY;

-- Plants policies
CREATE POLICY "Users can view their own plants"
  ON plants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plants"
  ON plants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON plants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON plants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watering history policies
CREATE POLICY "Users can view watering history for their plants"
  ON watering_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = watering_history.plant_id
    AND plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can create watering history for their plants"
  ON watering_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = watering_history.plant_id
    AND plants.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to plants table
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();