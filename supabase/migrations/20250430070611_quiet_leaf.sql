/*
  # Remove location constraint

  1. Changes
    - Remove the CHECK constraint on the location column in plants table
    - Allow any text value for location
*/

DO $$ 
BEGIN
  -- Remove the existing check constraint
  ALTER TABLE plants
  DROP CONSTRAINT IF EXISTS plants_location_check;
END $$;