import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Use placeholder values in demo mode
const supabaseUrl = isDemoMode ? 'https://demo.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = isDemoMode ? 'demo-key' : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const createServerSupabaseClient = () => {
  const serverUrl = isDemoMode ? 'https://demo.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serverKey = isDemoMode ? 'demo-service-key' : process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(serverUrl, serverKey)
}