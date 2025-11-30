import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // We don't want to crash the app if these are missing during build time, 
    // but we should log a warning.
    console.warn('Missing Supabase environment variables - using placeholders')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
