import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

type MoodType = 'stressed' | 'tired' | 'focused' | 'happy'

interface MoodSuggestion {
  title: string
  description: string
  duration: string
  icon: string
}

const MOOD_SUGGESTIONS: Record<MoodType, MoodSuggestion[]> = {
  stressed: [
    {
      title: 'Box Breathing',
      description: 'Breathe in for 4, hold for 4, exhale for 4, hold for 4',
      duration: '1 min',
      icon: '🫁',
    },
    {
      title: 'Neck Stretch',
      description: 'Gently roll your neck to release tension',
      duration: '30 sec',
      icon: '💆‍♀️',
    },
    {
      title: 'Gaze Away',
      description: 'Look at something far away to rest your eyes',
      duration: '60 sec',
      icon: '👀',
    },
  ],
  tired: [
    {
      title: 'Stand & Stretch',
      description: 'Stand up and do some energizing stretches',
      duration: '60 sec',
      icon: '🤸‍♂️',
    },
    {
      title: 'Drink Water',
      description: 'Hydrate to boost your energy levels',
      duration: '1 min',
      icon: '💧',
    },
    {
      title: 'Brisk Walk',
      description: 'Take a quick walk to get your blood flowing',
      duration: '2 min',
      icon: '🚶‍♀️',
    },
  ],
  focused: [
    {
      title: 'Plan Next Goal',
      description: 'Set a micro-goal for the next 25 minutes',
      duration: '2 min',
      icon: '🎯',
    },
    {
      title: 'Pomodoro Break',
      description: 'Take a 5-minute break after 25 minutes of focus',
      duration: '5 min',
      icon: '⏰',
    },
    {
      title: 'Light Hydration',
      description: 'Take small sips of water to stay hydrated',
      duration: '30 sec',
      icon: '💧',
    },
  ],
  happy: [
    {
      title: 'Maintain Flow',
      description: 'Keep up the great work and stay in the zone',
      duration: '0 min',
      icon: '🌟',
    },
    {
      title: 'Gratitude Note',
      description: 'Write down something you\'re grateful for',
      duration: '2 min',
      icon: '📝',
    },
    {
      title: 'Posture Check',
      description: 'Adjust your posture for continued comfort',
      duration: '30 sec',
      icon: '🪑',
    },
  ],
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Extract and verify JWT token
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    const userId = await verifyJWT(token)

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathname = url.pathname.replace('/functions/v1/moods-api', '')

    if (pathname === '' && req.method === 'GET') {
      const { data: moods, error } = await supabaseClient
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch moods' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(moods || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '' && req.method === 'POST') {
      const { mood, note } = await req.json()

      if (!mood || !['stressed', 'tired', 'focused', 'happy'].includes(mood)) {
        return new Response(
          JSON.stringify({ error: 'Valid mood is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: newMood, error } = await supabaseClient
        .from('moods')
        .insert([{
          user_id: userId,
          mood: mood as MoodType,
          note: note || '',
        }])
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create mood entry' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(newMood),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/suggest' && req.method === 'GET') {
      // Get user's latest mood
      const { data: latestMood, error } = await supabaseClient
        .from('moods')
        .select('mood')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !latestMood) {
        // Return default suggestions if no mood found
        return new Response(
          JSON.stringify({
            suggestions: [
              {
                title: 'Take a Deep Breath',
                description: 'Practice mindful breathing to center yourself',
                duration: '2 min',
                icon: '🫁',
              },
              {
                title: 'Stretch Break',
                description: 'Stand up and do some gentle stretches',
                duration: '3 min',
                icon: '🤸‍♀️',
              },
              {
                title: 'Hydrate',
                description: 'Drink a glass of water to refresh yourself',
                duration: '1 min',
                icon: '💧',
              },
            ]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const suggestions = MOOD_SUGGESTIONS[latestMood.mood as MoodType] || []

      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function verifyJWT(token: string): Promise<string | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null
    }

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload.sub
  } catch {
    return null
  }
}