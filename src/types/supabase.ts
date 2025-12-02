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
                    id: number
                    name: string
                    keywords: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    keywords: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    keywords?: string
                    created_at?: string
                }
            }
            ideas: {
                Row: {
                    id: number
                    name: string
                    pitch: string
                    key_pain_insight: string
                    score: number
                    theme_id: number
                    mvp: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    pitch: string
                    key_pain_insight: string
                    score: number
                    theme_id: number
                    mvp: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    pitch?: string
                    key_pain_insight?: string
                    score?: number
                    theme_id?: number
                    mvp?: string
                    created_at?: string
                }
            }
            idea_sources: {
                Row: {
                    id: number
                    idea_id: number
                    source_type: string
                    url: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    idea_id: number
                    source_type: string
                    url: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    idea_id?: number
                    source_type?: string
                    url?: string
                    created_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: number
                    owner_id: string
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    owner_id: string
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    owner_id?: string
                    email?: string
                    created_at?: string
                }
            }
            subscription_themes: {
                Row: {
                    id: number
                    subscription_id: number
                    theme_id: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    subscription_id: number
                    theme_id: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    subscription_id?: number
                    theme_id?: number
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
