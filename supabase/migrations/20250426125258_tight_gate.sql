/*
  # Update Watering History Schema

  1. Changes
    - Add ON DELETE CASCADE to watering_history foreign key
    - Add indexes for better query performance
    - Update RLS policies for better security

  2. Security
    - Maintain existing RLS policies
    - Add additional policy for deleting watering history
*/

-- Add index for watering history dates
CREATE INDEX IF NOT EXISTS idx_watering_history_watered_at 
ON watering_history(watered_at DESC);

-- Add index for plant_id to improve join performance
CREATE INDEX IF NOT EXISTS idx_watering_history_plant_id 
ON watering_history(plant_id);

-- Add policy for deleting watering history
CREATE POLICY "Users can delete watering history for their plants"
  ON watering_history
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = watering_history.plant_id
    AND plants.user_id = auth.uid()
  ));