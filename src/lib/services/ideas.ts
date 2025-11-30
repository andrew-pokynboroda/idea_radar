import { createSSRClient } from '@/lib/clients/supabase'
import { Database } from '@/types/supabase'

export type Theme = Database['public']['Tables']['themes']['Row'] & {
    sources?: Database['public']['Tables']['idea_sources']['Row'][]
}
export type Idea = Database['public']['Tables']['ideas']['Row'] & {
    theme?: Theme
}

export async function getThemes(): Promise<Theme[]> {
    const supabase = await createSSRClient()
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching themes:', error)
        return []
    }

    return data || []
}

export async function getIdeas(themeIds: number[] = [], sortBy: 'newest' | 'score' = 'score'): Promise<Idea[]> {
    const supabase = await createSSRClient()
    let query = supabase
        .from('ideas')
        .select(`
      *,
      theme:themes(
        *,
        sources:idea_sources(*)
      )
    `)

    if (themeIds.length > 0) {
        query = query.in('theme_id', themeIds)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching ideas:', error)
        return []
    }

    return (data || []) as Idea[]
}

export async function getIdeaById(id: number): Promise<Idea | null> {
    const supabase = await createSSRClient()
    const { data, error } = await supabase
        .from('ideas')
        .select(`
      *,
      theme:themes(
        *,
        sources:idea_sources(*)
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching idea:', error)
        return null
    }

    return data as Idea
}
