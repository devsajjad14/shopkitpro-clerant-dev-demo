import { NextRequest, NextResponse } from 'next/server'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { db, query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await query(async () => {
      return await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, email)
      })
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await query(async () => {
      await db.update(adminUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(adminUsers.id, admin.id))
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      }
    })
  } catch (error) {
    console.error('Auto-login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
} 