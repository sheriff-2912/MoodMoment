import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
    const pathname = url.pathname.replace('/functions/v1/user-api', '')

    if (pathname === '/me' && req.method === 'GET') {
      const { data: user, error } = await supabaseClient
        .from('users')
        .select('id, email, full_name, is_admin, created_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(user),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/me' && req.method === 'PUT') {
      const { fullName, newPassword } = await req.json()

      if (!fullName) {
        return new Response(
          JSON.stringify({ error: 'Full name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let updateData: any = { full_name: fullName }

      if (newPassword) {
        // Get user email for password hashing
        const { data: user } = await supabaseClient
          .from('users')
          .select('email')
          .eq('id', userId)
          .single()

        if (!user) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Hash new password
        const hashedPassword = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(newPassword + user.email)
        )
        const passwordHash = Array.from(new Uint8Array(hashedPassword))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        updateData.password_hash = passwordHash
      }

      const { data: updatedUser, error } = await supabaseClient
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, email, full_name, is_admin, created_at')
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ user: updatedUser }),
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