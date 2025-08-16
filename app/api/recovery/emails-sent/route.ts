import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { campaignEmails } from '@/lib/db/schema'
import { or, eq, count } from 'drizzle-orm'

export async function GET() {
  try {
    const sent = await db.select({ count: count() }).from(campaignEmails).where(
      or(eq(campaignEmails.status, 'sent'), eq(campaignEmails.status, 'resent'))
    )
    const countValue = sent[0]?.count ? Number(sent[0].count) : 0
    return NextResponse.json({ success: true, count: countValue })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 