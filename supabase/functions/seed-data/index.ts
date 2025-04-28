import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const plantData = [
  {
    name: 'Monstera Deliciosa',
    species: 'Monstera Deliciosa',
    location: 'Indoor',
    watering_frequency_days: 7,
    last_watered_at: '2025-03-24T12:00:00Z',
  },
  {
    name: 'Snake Plant',
    species: 'Snake Plant (Sansevieria)',
    location: 'Indoor',
    watering_frequency_days: 14,
    last_watered_at: '2025-04-01T12:00:00Z',
  },
  {
    name: 'Fiddle Leaf Fig',
    species: 'Fiddle Leaf Fig (Ficus lyrata)',
    location: 'Indoor',
    watering_frequency_days: 10,
    last_watered_at: '2025-03-31T12:00:00Z',
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authenticated user's ID from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Insert plants for the authenticated user
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .insert(
        plantData.map(plant => ({
          ...plant,
          user_id: user.id
        }))
      )
      .select();

    if (plantsError) {
      throw plantsError;
    }

    // Insert watering history for each plant
    for (const plant of plants) {
      const wateringDates = [];
      const lastWatered = new Date(plant.last_watered_at);
      
      // Create 3 past watering dates for each plant
      for (let i = 0; i < 3; i++) {
        wateringDates.push({
          plant_id: plant.id,
          watered_at: new Date(lastWatered.getTime() - (i * plant.watering_frequency_days * 24 * 60 * 60 * 1000)).toISOString()
        });
      }

      const { error: historyError } = await supabase
        .from('watering_history')
        .insert(wateringDates);

      if (historyError) {
        throw historyError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data seeded successfully' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});