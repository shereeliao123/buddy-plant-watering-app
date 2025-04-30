/*
  # Add plant species table

  1. New Tables
    - `plant_species`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Public read access
      - Authenticated users can insert/update/delete
*/

-- Create plant_species table
CREATE TABLE IF NOT EXISTS plant_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plant_species ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read" ON plant_species FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON plant_species FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON plant_species FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON plant_species FOR DELETE TO authenticated USING (true);

-- Add updated_at trigger to plant_species table
CREATE TRIGGER update_plant_species_updated_at
  BEFORE UPDATE ON plant_species
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();