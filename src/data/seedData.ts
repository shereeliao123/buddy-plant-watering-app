import { supabase } from '../lib/supabase';

// This function is no longer used since we want users to start with an empty plant list
export async function seedInitialData() {
  throw new Error('Seeding initial data is disabled');
}