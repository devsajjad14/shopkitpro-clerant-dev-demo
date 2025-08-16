import { NextRequest, NextResponse } from 'next/server'
import { getPageById, updatePage, deletePage, permanentlyDeletePage, restorePage, incrementPageViews } from '@/lib/actions/pages'

// GET /api/pages/[id] - Get a single page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      )
    }

    const result = await getPageById(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error in GET /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validation
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }

    if (body.slug !== undefined && !body.slug.trim()) {
      return NextResponse.json(
        { error: 'Slug cannot be empty' },
        { status: 400 }
      )
    }

    const result = await updatePage(id, {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      canonicalUrl: body.canonicalUrl,
      template: body.template,
      featuredImage: body.featuredImage,
      pageType: body.pageType,
      isPublic: body.isPublic,
      passwordProtected: body.passwordProtected,
      password: body.password,
      allowComments: body.allowComments,
      parentId: body.parentId,
      menuOrder: body.menuOrder,
      showInMenu: body.showInMenu,
      showInSitemap: body.showInSitemap,
      publishedAt: body.publishedAt,
      scheduledAt: body.scheduledAt,
      lastEditedBy: body.lastEditedBy,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Page not found' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Page updated successfully',
    })
  } catch (error) {
    console.error('Error in PUT /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - Delete a page (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    const result = permanent 
      ? await permanentlyDeletePage(id)
      : await deletePage(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Page not found' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Page ${permanent ? 'permanently deleted' : 'deleted'} successfully`,
    })
  } catch (error) {
    console.error('Error in DELETE /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/pages/[id] - Partial updates and special operations
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const operation = body.operation

    switch (operation) {
      case 'restore':
        const restoreResult = await restorePage(id)
        if (!restoreResult.success) {
          return NextResponse.json(
            { error: restoreResult.error },
            { status: restoreResult.error === 'Page not found' ? 404 : 500 }
          )
        }
        return NextResponse.json({
          success: true,
          data: restoreResult.data,
          message: 'Page restored successfully',
        })

      case 'increment-views':
        const viewsResult = await incrementPageViews(id)
        if (!viewsResult.success) {
          return NextResponse.json(
            { error: viewsResult.error },
            { status: 500 }
          )
        }
        return NextResponse.json({
          success: true,
          data: viewsResult.data,
          message: 'Page views incremented',
        })

      case 'publish':
        const publishResult = await updatePage(id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
        })
        if (!publishResult.success) {
          return NextResponse.json(
            { error: publishResult.error },
            { status: publishResult.error === 'Page not found' ? 404 : 500 }
          )
        }
        return NextResponse.json({
          success: true,
          data: publishResult.data,
          message: 'Page published successfully',
        })

      case 'unpublish':
        const unpublishResult = await updatePage(id, {
          status: 'draft',
          publishedAt: null,
        })
        if (!unpublishResult.success) {
          return NextResponse.json(
            { error: unpublishResult.error },
            { status: unpublishResult.error === 'Page not found' ? 404 : 500 }
          )
        }
        return NextResponse.json({
          success: true,
          data: unpublishResult.data,
          message: 'Page unpublished successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in PATCH /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 