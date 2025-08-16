import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function POST() {
  // Clear Redis product keys (assuming all product keys start with 'products:')
  const keys = await redis.keys('products:*')
  if (keys.length > 0) {
    await redis.del(...keys)
  }

  return NextResponse.json({ success: true })
} 