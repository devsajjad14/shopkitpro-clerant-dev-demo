import { NextRequest, NextResponse } from 'next/server'
import { getPages, createPage } from '@/lib/actions/pages'

// GET /api/pages - Fetch all pages with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'title' | 'viewCount'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc'

    const options = {
      status: status || undefined,
      search: search || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      sortBy: sortBy || 'updatedAt',
      sortOrder: sortOrder || 'desc',
    }

    const result = await getPages(options)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error in GET /api/pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPages = await getPages({ search: body.slug })
    if (existingPages.success && existingPages.data.length > 0) {
      const existingPage = existingPages.data.find(page => page.slug === body.slug)
      if (existingPage) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const result = await createPage({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status || 'draft',
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      canonicalUrl: body.canonicalUrl,
      template: body.template || 'default',
      featuredImage: body.featuredImage,
      pageType: body.pageType || 'page',
      isPublic: body.isPublic !== undefined ? body.isPublic : true,
      passwordProtected: body.passwordProtected || false,
      password: body.password,
      allowComments: body.allowComments || false,
      parentId: body.parentId || null,
      menuOrder: body.menuOrder || 0,
      showInMenu: body.showInMenu !== undefined ? body.showInMenu : true,
      showInSitemap: body.showInSitemap !== undefined ? body.showInSitemap : true,
      publishedAt: body.publishedAt || null,
      scheduledAt: body.scheduledAt || null,
      authorId: body.authorId || null,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Page created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 