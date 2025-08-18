import { NextRequest, NextResponse } from 'next/server'

const importUsersService = () => import('@/lib/admin/users-service')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search'),
      role: searchParams.get('role')
    }
    
    const { getAllAdminUsers } = await importUsersService()
    const users = await getAllAdminUsers(filters)
    
    return NextResponse.json({
      success: true,
      users
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const { createUser } = await importUsersService()
    
    const result = await createUser(userData)
    
    return NextResponse.json({
      success: true,
      user: result[0],
      message: 'User created successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }, { status: 500 })
  }
}