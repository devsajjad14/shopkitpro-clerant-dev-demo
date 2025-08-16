import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userProfiles, adminUsers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { deleteAsset } from '@/lib/services/platform-upload-service'

// GET all admin users
export async function GET() {
  try {
    const allUsers = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt))

    const response = NextResponse.json(allUsers)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST new admin user
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const address = formData.get('address') as string
    const image = formData.get('image') as string | null

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const [adminUser] = await db.insert(adminUsers).values({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      status,
      address,
      profileImage: image,
      phoneNumber,
    }).returning()

    // Return the complete user data
    const [completeUser] = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, adminUser.id))

    return NextResponse.json(completeUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT update admin user
export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string | null
    const phoneNumber = formData.get('phoneNumber') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const address = formData.get('address') as string
    const image = formData.get('image') as string | null

    console.log('[PUT /api/admin/users] Updating user:', { id, name, email, role, status, hasImage: !!image, hasPassword: !!password })

    // Get current user data for image cleanup
    const [currentUser] = await db.select({
      profileImage: adminUsers.profileImage
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      status,
      address,
      phoneNumber,
      updatedAt: new Date(),
    }

    // Add password hash if password is being updated
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
      console.log('[PUT /api/admin/users] Password will be updated')
    }

    // Add new image if provided
    if (image) {
      updateData.profileImage = image
      console.log('[PUT /api/admin/users] Profile image will be updated to:', image)
    }

    // Update admin user in database
    await db
      .update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, id))

    console.log('[PUT /api/admin/users] Database update completed')

    // Cleanup old image if new image was uploaded
    if (image && currentUser?.profileImage && currentUser.profileImage !== image) {
      console.log('[PUT /api/admin/users] Cleaning up old image:', currentUser.profileImage)
      const isVercelUrl = currentUser.profileImage.includes('blob.vercel-storage.com')
      console.log('[PUT /api/admin/users] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      try {
        const deleteSuccess = await deleteAsset(currentUser.profileImage)
        if (deleteSuccess) {
          console.log('[PUT /api/admin/users] ✅ Old image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
        } else {
          console.log('[PUT /api/admin/users] ⚠️ Old image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[PUT /api/admin/users] Failed to cleanup old image:', cleanupError)
        // Don't fail the update if cleanup fails
      }
    }

    // Get the complete updated user data
    const [updatedUser] = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))

    console.log('[PUT /api/admin/users] Returning updated user:', { 
      id: updatedUser.id, 
      name: updatedUser.name, 
      image: updatedUser.image 
    })

    const response = NextResponse.json(updatedUser)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE admin user (hard delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('DELETE request received for user ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists before deleting and get profile image for cleanup
    const [existingUser] = await db
      .select({
        id: adminUsers.id,
        profileImage: adminUsers.profileImage
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, id))

    console.log('User found before delete:', !!existingUser)

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User profile image to cleanup:', existingUser.profileImage)

    // Clean up profile image if it exists
    if (existingUser.profileImage) {
      console.log('[USER-DELETE] Cleaning up profile image:', existingUser.profileImage)
      const isVercelUrl = existingUser.profileImage.includes('blob.vercel-storage.com')
      console.log('[USER-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      try {
        const deleteSuccess = await deleteAsset(existingUser.profileImage)
        if (deleteSuccess) {
          console.log('[USER-DELETE] ✅ Profile image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
        } else {
          console.log('[USER-DELETE] ⚠️ Profile image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[USER-DELETE] Failed to cleanup profile image:', cleanupError)
        // Don't fail the user deletion if image cleanup fails
      }
    } else {
      console.log('[USER-DELETE] No profile image to clean up')
    }

    // Hard delete by removing the user from adminUsers table
    const deleteResult = await db
      .delete(adminUsers)
      .where(eq(adminUsers.id, id))
      .returning()

    console.log('Delete result:', deleteResult)

    // Verify the user was actually deleted
    const [userAfterDelete] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))

    console.log('User found after delete:', !!userAfterDelete)

    if (userAfterDelete) {
      console.error('User still exists after delete operation')
      return NextResponse.json(
        { error: 'Failed to delete user - user still exists in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, deletedUser: deleteResult[0] })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 