import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recoveryCampaigns, cartAbandonmentToggle, campaignEmails } from '@/lib/db/schema'
import { eq, and, gte, count } from 'drizzle-orm'

export async function GET() {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    // Get all campaigns
    const campaigns = await db.select().from(recoveryCampaigns).orderBy(recoveryCampaigns.createdAt)

    // For each campaign, get real stats from campaignEmails
    const campaignStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Count emails sent
        const sent = await db.select({ count: count() }).from(campaignEmails).where(eq(campaignEmails.campaignId, campaign.id))
        const emailsSent = sent[0]?.count ? Number(sent[0].count) : 0
        // Count opened
        const opened = await db.select({ count: count() }).from(campaignEmails).where(
          eq(campaignEmails.campaignId, campaign.id)
        ).where(eq(campaignEmails.status, 'opened'))
        const emailsOpened = opened[0]?.count ? Number(opened[0].count) : 0
        // Count clicked
        const clicked = await db.select({ count: count() }).from(campaignEmails).where(
          eq(campaignEmails.campaignId, campaign.id)
        ).where(eq(campaignEmails.status, 'clicked'))
        const emailsClicked = clicked[0]?.count ? Number(clicked[0].count) : 0
        // Calculate recovery rate: (recovered / sent) * 100
        const recovered = await db.select({ count: count() }).from(campaignEmails).where(
          eq(campaignEmails.campaignId, campaign.id)
        ).where(eq(campaignEmails.status, 'clicked')) // or use 'recovered' if you track it
        const recoveryRate = emailsSent > 0 ? (Number(recovered[0]?.count || 0) / emailsSent) * 100 : 0
        return {
          ...campaign,
          emailsSent,
          emailsOpened,
          emailsClicked,
          recoveryRate,
        }
      })
    )

    return NextResponse.json({
      success: true,
      campaigns: campaignStats
    })

  } catch (error) {
    console.error('Failed to fetch recovery campaigns:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      campaignType = 'email',
      template,
      subject,
      delayHours = 24,
      discountType,
      discountValue,
      discountCode,
      maxEmails = 3
    } = body

    if (!name || !subject) {
      return NextResponse.json({
        success: false,
        error: 'Name and subject are required'
      }, { status: 400 })
    }

    // Create new campaign
    const newCampaign = await db.insert(recoveryCampaigns).values({
      name,
      description: description || '',
      campaignType,
      template: template || 'default',
      subject,
      delayHours,
      discountType,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      discountCode,
      maxEmails,
      isActive: true
    }).returning()

    return NextResponse.json({
      success: true,
      campaign: newCampaign[0]
    })

  } catch (error) {
    console.error('Failed to create recovery campaign:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 