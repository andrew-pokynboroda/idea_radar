import { createSSRClient, createAdminClient } from '@/lib/clients/supabase'
import { Database } from '@/types/supabase'

export type Theme = Database['public']['Tables']['themes']['Row']

export type Idea = Database['public']['Tables']['ideas']['Row'] & {
    theme?: Theme
    sources?: Database['public']['Tables']['idea_sources']['Row'][]
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

export async function getIdeas(
    themeIds: number[] = [],
    sortBy: 'newest' | 'score' = 'score',
    page: number = 1,
    pageSize: number = 5
): Promise<{ ideas: Idea[], total: number }> {
    // Use Admin client to bypass RLS for now, ensuring sources are fetched
    const supabase = createAdminClient()

    // Calculate offset
    const offset = (page - 1) * pageSize

    // First, get the total count
    let countQuery = supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })

    if (themeIds.length > 0) {
        countQuery = countQuery.in('theme_id', themeIds)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
        console.error('Error counting ideas:', countError)
        return { ideas: [], total: 0 }
    }

    // Then get the paginated data
    let query = supabase
        .from('ideas')
        .select(`
      *,
      theme:themes(*),
      sources:idea_sources(*)
    `)

    if (themeIds.length > 0) {
        query = query.in('theme_id', themeIds)
    }

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

    const { data, error } = await query

    if (error) {
        console.error('Error fetching ideas:', error)
        return { ideas: [], total: 0 }
    }

    return {
        ideas: (data || []) as Idea[],
        total: count || 0
    }
}

export async function getIdeaById(id: number): Promise<Idea | null> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('ideas')
        .select(`
      *,
      theme:themes(*),
      sources:idea_sources(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching idea:', error)
        return null
    }

    return data as Idea
}
