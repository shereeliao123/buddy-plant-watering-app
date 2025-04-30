/*
  # Seed plant species data

  1. Changes
    - Insert initial plant species data into plant_species table
    - Ensure unique constraint on plant names
*/

-- Insert plant species data
INSERT INTO plant_species (name)
VALUES
  ('Aloe Vera'),
  ('Bird of Paradise (Strelitzia)'),
  ('Boston Fern (Nephrolepis exaltata)'),
  ('Bougainvillea'),
  ('Chinese Money Plant (Pilea peperomioides)'),
  ('Fiddle Leaf Fig (Ficus lyrata)'),
  ('Geranium'),
  ('Hydrangea'),
  ('Jade Plant (Crassula ovata)'),
  ('Lavender'),
  ('Lemon Tree'),
  ('Monstera Deliciosa'),
  ('Peace Lily (Spathiphyllum)'),
  ('Pothos (Epipremnum aureum)'),
  ('Rosemary'),
  ('Rubber Plant (Ficus elastica)'),
  ('Snake Plant (Sansevieria)'),
  ('Spider Plant (Chlorophytum comosum)'),
  ('Succulents'),
  ('ZZ Plant (Zamioculcas zamiifolia)')
ON CONFLICT (name) DO NOTHING;