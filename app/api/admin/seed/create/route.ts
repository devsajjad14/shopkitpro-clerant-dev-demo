import { NextResponse } from 'next/server';

export async function POST() {
  // Seed functionality disabled - use data manager instead
  return NextResponse.json({
    success: false,
    error: 'Seed functionality is disabled. Use the data manager for importing data.',
    message: 'Please use /admin/data-manager/import for data import operations.'
  }, { status: 501 })
}