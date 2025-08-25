import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AuthRequest {
  email: string
  password: string
  fullName?: string
}

interface ResetRequest {
  email?: string
  token?: string
  newPassword?: string
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

    const url = new URL(req.url)
    const pathname = url.pathname.replace('/functions/v1/auth-api', '')

    if (pathname === '/register' && req.method === 'POST') {
      const { email, password, fullName }: AuthRequest = await req.json()

      if (!email || !password || !fullName) {
        return new Response(
          JSON.stringify({ error: 'Email, password, and full name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Hash the password
      const hashedPassword = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password + email)
      )
      const passwordHash = Array.from(new Uint8Array(hashedPassword))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Check if user already exists
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create user
      const { data: user, error } = await supabaseClient
        .from('users')
        .insert([{ email, full_name: fullName, password_hash: passwordHash }])
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate JWT token
      const token = await generateJWT(user.id)

      return new Response(
        JSON.stringify({ 
          access_token: token, 
          user: { ...user, password_hash: undefined } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/login' && req.method === 'POST') {
      const { email, password }: AuthRequest = await req.json()

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Hash the provided password
      const hashedPassword = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password + email)
      )
      const passwordHash = Array.from(new Uint8Array(hashedPassword))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Find user
      const { data: user, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate JWT token
      const token = await generateJWT(user.id)

      return new Response(
        JSON.stringify({ 
          access_token: token, 
          user: { ...user, password_hash: undefined } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/password/reset/request' && req.method === 'POST') {
      const { email }: ResetRequest = await req.json()

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user exists
      const { data: user } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return new Response(
          JSON.stringify({ message: 'Reset link sent if email exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate reset token
      const resetToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token
      await supabaseClient
        .from('password_reset_tokens')
        .insert([{
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        }])

      // In production, this would send an email
      const resetLink = `${req.headers.get('origin')}/reset-password?token=${resetToken}`

      return new Response(
        JSON.stringify({ 
          message: 'Reset link generated',
          resetLink // For demo purposes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/password/reset/confirm' && req.method === 'POST') {
      const { token, newPassword }: ResetRequest = await req.json()

      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Token and new password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Find and validate token
      const { data: resetToken, error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .select('user_id, expires_at, used')
        .eq('token', token)
        .single()

      if (tokenError || !resetToken || resetToken.used || new Date() > new Date(resetToken.expires_at)) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user email for password hashing
      const { data: user } = await supabaseClient
        .from('users')
        .select('email')
        .eq('id', resetToken.user_id)
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

      // Update password
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', resetToken.user_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Mark token as used
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token)

      return new Response(
        JSON.stringify({ message: 'Password updated successfully' }),
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

async function generateJWT(userId: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const data = `${headerB64}.${payloadB64}`
  const secret = encoder.encode('your-secret-key-here') // In production, use a proper secret

  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    encoder.encode(data)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${data}.${signatureB64}`
}