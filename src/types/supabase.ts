export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            themes: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            ideas: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    pitch: string
                    key_pain_insight: string
                    score: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    pitch: string
                    key_pain_insight: string
                    score: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    pitch?: string
                    key_pain_insight?: string
                    score?: number
                    created_at?: string
                }
            }
            idea_sources: {
                Row: {
                    id: string
                    owner_id: string
                    source_type: string
                    source_identifier: string
                    source_url: string
                    extracted_insight: string | null
                    idea_id: string | null
                }
                Insert: {
                    id?: string
                    owner_id: string
                    source_type: string
                    source_identifier: string
                    source_url: string
                    extracted_insight?: string | null
                    idea_id?: string | null
                }
                Update: {
                    id?: string
                    owner_id?: string
                    source_type?: string
                    source_identifier?: string
                    source_url?: string
                    extracted_insight?: string | null
                    idea_id?: string | null
                }
            }
            idea_themes: {
                Row: {
                    idea_id: string
                    theme_id: string
                    owner_id: string
                    created_at: string
                }
                Insert: {
                    idea_id: string
                    theme_id: string
                    owner_id: string
                    created_at?: string
                }
                Update: {
                    idea_id?: string
                    theme_id?: string
                    owner_id?: string
                    created_at?: string
                }
            }
            email_subscriptions: {
                Row: {
                    id: string
                    owner_id: string | null
                    email: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id?: string | null
                    email: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string | null
                    email?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
            subscription_themes: {
                Row: {
                    subscription_id: string
                    theme_id: string
                    owner_id: string
                    created_at: string
                }
                Insert: {
                    subscription_id: string
                    theme_id: string
                    owner_id: string
                    created_at?: string
                }
                Update: {
                    subscription_id?: string
                    theme_id?: string
                    owner_id?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
