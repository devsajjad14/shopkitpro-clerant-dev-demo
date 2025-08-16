import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recoveryCampaigns, cartAbandonmentToggle } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    const campaign = await db
      .select()
      .from(recoveryCampaigns)
      .where(eq(recoveryCampaigns.id, params.id))
      .limit(1)

    if (campaign.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      campaign: campaign[0]
    })

  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData: any = {}

    // Only allow specific fields to be updated
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.subject !== undefined) updateData.subject = body.subject
    if (body.delayHours !== undefined) updateData.delayHours = body.delayHours
    if (body.discountType !== undefined) updateData.discountType = body.discountType
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue
    if (body.discountCode !== undefined) updateData.discountCode = body.discountCode
    if (body.maxEmails !== undefined) updateData.maxEmails = body.maxEmails
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    updateData.updatedAt = new Date()

    const updatedCampaign = await db
      .update(recoveryCampaigns)
      .set(updateData)
      .where(eq(recoveryCampaigns.id, params.id))
      .returning()

    if (updatedCampaign.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign[0]
    })

  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    const deletedCampaign = await db
      .delete(recoveryCampaigns)
      .where(eq(recoveryCampaigns.id, params.id))
      .returning()

    if (deletedCampaign.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 