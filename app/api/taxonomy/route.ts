import { NextRequest, NextResponse } from 'next/server';
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy';

export async function GET(req: NextRequest) {
  try {
    const data = await fetchTaxonomyData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch taxonomy data' }, { status: 500 })
  }
} 