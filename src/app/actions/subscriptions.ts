'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { createSSRClient } from '@/lib/clients/supabase'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

export async function subscribeToThemes(themeIds: number[]) {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) throw new Error('No email found')

    const supabase = await createSSRClient() as any

    // 1. Get or Create Subscription
    let { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!subscription) {
        const { data: newSub, error } = await supabase
            .from('subscriptions')
            .insert({ owner_id: user.id, email })
            .select('id')
            .single()

        if (error) throw error
        if (!newSub) throw new Error('Failed to create subscription')
        subscription = newSub
    }

    // 2. Insert Subscription Themes
    // Check existing to avoid duplicates
    const { data: existing } = await supabase
        .from('subscription_themes')
        .select('theme_id')
        .eq('subscription_id', subscription.id)
        .in('theme_id', themeIds)

    const existingIds = new Set(existing?.map((x: { theme_id: number }) => x.theme_id) || [])
    const toInsert = themeIds.filter(id => !existingIds.has(id)).map(theme_id => ({
        subscription_id: subscription!.id,
        theme_id,
        owner_id: user.id,
    }))

    if (toInsert.length > 0) {
        const { error } = await supabase.from('subscription_themes').insert(toInsert)
        if (error) throw error
    }

    revalidatePath('/ideas')
}

export async function unsubscribeFromTheme(themeId: number) {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    const supabase = await createSSRClient() as any

    // Get subscription id
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!subscription) return

    await supabase
        .from('subscription_themes')
        .delete()
        .eq('subscription_id', subscription.id)
        .eq('theme_id', themeId)

    revalidatePath('/ideas')
}

export async function getUserSubscription() {
    const user = await currentUser()
    if (!user) return null

    const supabase = await createSSRClient() as any

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
            *,
            subscription_themes (
                theme_id,
                theme:themes (
                    id,
                    name
                )
            )
        `)
        .eq('owner_id', user.id)
        .single()

    return subscription
}
