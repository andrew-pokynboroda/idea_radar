import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    // We don't want to crash the app if these are missing during build time, 
    // but we should log a warning.
    console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')
