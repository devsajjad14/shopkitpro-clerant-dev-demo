import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path') || '/';
    await revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
} 