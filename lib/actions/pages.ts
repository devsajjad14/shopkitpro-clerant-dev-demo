import { db } from '@/lib/db'
import { pages, pageRevisions, pageCategories, pageCategoryRelations, pageAnalytics } from '@/lib/db/schema'
import { eq, desc, asc, and, or, like, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'
import { deleteAsset } from '@/lib/services/platform-upload-service'

// Helper function to extract image URLs from HTML content
function extractImageUrls(html: string): string[] {
  if (!html) return []
  
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const urls: string[] = []
  let match
  
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1]
    // Only include page images (from our pages directory)
    if (url.includes('/media/pages/') || url.includes('blob.vercel-storage.com') && url.includes('pages/')) {
      urls.push(url)
    }
  }
  
  return urls
}

// Helper function to cleanup page images
async function cleanupPageImages(imageUrls: string[], context: string) {
  if (!imageUrls || imageUrls.length === 0) return
  
  console.log(`[PAGE-CLEANUP-${context}] Starting cleanup for ${imageUrls.length} images`)
  
  for (const imageUrl of imageUrls) {
    try {
      console.log(`[PAGE-CLEANUP-${context}] Cleaning up image: ${imageUrl}`)
      const isVercelUrl = imageUrl.includes('blob.vercel-storage.com')
      console.log(`[PAGE-CLEANUP-${context}] Platform detected: ${isVercelUrl ? 'Vercel' : 'Server'}`)
      
      const deleteSuccess = await deleteAsset(imageUrl)
      if (deleteSuccess) {
        console.log(`[PAGE-CLEANUP-${context}] ✅ Image deleted successfully: ${imageUrl}`)
      } else {
        console.log(`[PAGE-CLEANUP-${context}] ⚠️ Image delete returned false: ${imageUrl}`)
      }
    } catch (cleanupError) {
      console.error(`[PAGE-CLEANUP-${context}] Failed to cleanup image ${imageUrl}:`, cleanupError)
    }
  }
}

// Get all pages with optional filters
export async function getPages(options?: {
  status?: string
  search?: string
  categoryId?: number
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}) {
  try {
    let query = db.select().from(pages);
    const conditions = [eq(pages.isDeleted, false)];

    // Status filter
    if (options?.status && options.status !== 'all') {
      const allowedStatus = ['draft', 'published'] as const;
      if (allowedStatus.includes(options.status as any)) {
        conditions.push(eq(pages.status, options.status as 'draft' | 'published'));
      }
    }

    // Search filter
    if (options?.search) {
      conditions.push(
        or(
          like(pages.title, `%${options.search}%`),
          like(pages.slug, `%${options.search}%`)
        )
      );
    }

    // Combine all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = options?.sortBy || 'updatedAt'
    const sortOrder = options?.sortOrder || 'desc'
    
    if (sortField === 'createdAt') {
      query = query.orderBy(sortOrder === 'desc' ? desc(pages.createdAt) : asc(pages.createdAt))
    } else if (sortField === 'updatedAt') {
      query = query.orderBy(sortOrder === 'desc' ? desc(pages.updatedAt) : asc(pages.updatedAt))
    } else if (sortField === 'title') {
      query = query.orderBy(sortOrder === 'desc' ? desc(pages.title) : asc(pages.title))
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.offset(options.offset)
    }

    const result = await query
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching pages:', error)
    return { success: false, error: 'Failed to fetch pages' }
  }
}

// Get a single page by ID
export async function getPageById(id: number) {
  try {
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error fetching page:', error)
    return { success: false, error: 'Failed to fetch page' }
  }
}

// Get a page by slug
export async function getPageBySlug(slug: string) {
  try {
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return { success: false, error: 'Failed to fetch page' }
  }
}

// Create a new page (UI fields only)
export async function createPage(pageData: {
  title: string
  slug: string
  content?: string
  status?: 'Active' | 'Draft'
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  canonicalUrl?: string
  featuredImage?: string
  isPublic?: boolean
  allowComments?: boolean
}) {
  try {
    // Map UI status to DB status
    const dbStatus =
      pageData.status?.toLowerCase() === 'active' || pageData.status === 'published'
        ? 'published'
        : 'draft';
    const result = await db
      .insert(pages)
      .values({
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content || null,
        status: dbStatus,
        metaTitle: pageData.metaTitle || null,
        metaDescription: pageData.metaDescription || null,
        metaKeywords: pageData.metaKeywords || null,
        canonicalUrl: pageData.canonicalUrl || null,
        featuredImage: pageData.featuredImage || null,
        isPublic: pageData.isPublic ?? true,
        allowComments: pageData.allowComments ?? false,
        // createdAt, updatedAt, deletedAt, isDeleted handled by DB defaults
      })
      .returning()

    revalidatePath('/custom-cms/pages')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error creating page:', error)
    return { success: false, error: 'Failed to create page' }
  }
}

// Update a page (UI fields only)
export async function updatePage(id: number, pageData: {
  title?: string
  slug?: string
  content?: string
  status?: 'Active' | 'Draft'
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  canonicalUrl?: string
  featuredImage?: string
  isPublic?: boolean
  allowComments?: boolean
}) {
  try {
    // Get current page for cleanup comparison
    const currentPage = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1)

    if (currentPage.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    const current = currentPage[0]
    
    // Handle image cleanup for featured image changes
    if (pageData.featuredImage && current.featuredImage && current.featuredImage !== pageData.featuredImage) {
      console.log('[PAGE-UPDATE] Cleaning up old featured image:', current.featuredImage)
      const isVercelUrl = current.featuredImage.includes('blob.vercel-storage.com')
      console.log('[PAGE-UPDATE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      
      try {
        const deleteSuccess = await deleteAsset(current.featuredImage)
        if (deleteSuccess) {
          console.log('[PAGE-UPDATE] ✅ Old featured image deleted successfully')
        } else {
          console.log('[PAGE-UPDATE] ⚠️ Old featured image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[PAGE-UPDATE] Failed to cleanup old featured image:', cleanupError)
      }
    }

    // Handle content image cleanup if content has changed
    if (pageData.content && current.content && current.content !== pageData.content) {
      const oldContentImages = extractImageUrls(current.content)
      const newContentImages = extractImageUrls(pageData.content)
      
      // Find images that were removed from content
      const removedImages = oldContentImages.filter(url => !newContentImages.includes(url))
      if (removedImages.length > 0) {
        console.log(`[PAGE-UPDATE] Found ${removedImages.length} removed content images`)
        await cleanupPageImages(removedImages, 'UPDATE-CONTENT')
      }
    }

    const updateData: any = { ...pageData }
    if (pageData.status !== undefined) {
      updateData.status =
        (typeof pageData.status === 'string' && pageData.status.toLowerCase() === 'active') || pageData.status === 'published'
          ? 'published'
          : 'draft';
    }
    
    const result = await db
      .update(pages)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()

    revalidatePath('/custom-cms/pages')
    revalidatePath(`/custom-cms/pages/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error updating page:', error)
    return { success: false, error: 'Failed to update page' }
  }
}

// Delete a page (soft delete)
export async function deletePage(id: number) {
  try {
    const result = await db
      .update(pages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()

    if (result.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    revalidatePath('/custom-cms/pages')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error deleting page:', error)
    return { success: false, error: 'Failed to delete page' }
  }
}

// Permanently delete a page
export async function permanentlyDeletePage(id: number) {
  try {
    // Get the page first to clean up its images
    console.log('[PAGE-DELETE] Getting page data for cleanup:', id)
    const page = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1)

    if (page.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    const pageData = page[0]

    // Clean up featured image if it exists
    if (pageData.featuredImage) {
      console.log('[PAGE-DELETE] Cleaning up featured image:', pageData.featuredImage)
      const isVercelUrl = pageData.featuredImage.includes('blob.vercel-storage.com')
      console.log('[PAGE-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      
      try {
        const deleteSuccess = await deleteAsset(pageData.featuredImage)
        if (deleteSuccess) {
          console.log('[PAGE-DELETE] ✅ Featured image deleted successfully')
        } else {
          console.log('[PAGE-DELETE] ⚠️ Featured image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[PAGE-DELETE] Failed to cleanup featured image:', cleanupError)
      }
    }

    // Clean up content images if they exist
    if (pageData.content) {
      const contentImages = extractImageUrls(pageData.content)
      if (contentImages.length > 0) {
        console.log(`[PAGE-DELETE] Found ${contentImages.length} content images to cleanup`)
        await cleanupPageImages(contentImages, 'DELETE-CONTENT')
      } else {
        console.log('[PAGE-DELETE] No content images to clean up')
      }
    }

    // Delete the page from database
    const result = await db
      .delete(pages)
      .where(eq(pages.id, id))
      .returning()

    revalidatePath('/custom-cms/pages')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error permanently deleting page:', error)
    return { success: false, error: 'Failed to delete page' }
  }
}

// Restore a deleted page
export async function restorePage(id: number) {
  try {
    const result = await db
      .update(pages)
      .set({
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()

    if (result.length === 0) {
      return { success: false, error: 'Page not found' }
    }

    revalidatePath('/custom-cms/pages')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error restoring page:', error)
    return { success: false, error: 'Failed to restore page' }
  }
}

// Increment page view count
export async function incrementPageViews(id: number) {
  try {
    const result = await db
      .update(pages)
      .set({
        viewCount: sql`${pages.viewCount} + 1`,
        lastViewedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error incrementing page views:', error)
    return { success: false, error: 'Failed to increment page views' }
  }
}

// Get page categories
export async function getPageCategories() {
  try {
    const result = await db
      .select()
      .from(pageCategories)
      .where(eq(pageCategories.isActive, true))
      .orderBy(asc(pageCategories.sortOrder), asc(pageCategories.name))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching page categories:', error)
    return { success: false, error: 'Failed to fetch page categories' }
  }
}

// Create page category
export async function createPageCategory(categoryData: {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  sortOrder?: number
}) {
  try {
    const result = await db
      .insert(pageCategories)
      .values({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || null,
        color: categoryData.color || null,
        icon: categoryData.icon || null,
        sortOrder: categoryData.sortOrder || 0,
      })
      .returning()

    revalidatePath('/custom-cms/pages')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error creating page category:', error)
    return { success: false, error: 'Failed to create page category' }
  }
}

// Get page revisions
export async function getPageRevisions(pageId: number) {
  try {
    const result = await db
      .select()
      .from(pageRevisions)
      .where(eq(pageRevisions.pageId, pageId))
      .orderBy(desc(pageRevisions.revisionNumber))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching page revisions:', error)
    return { success: false, error: 'Failed to fetch page revisions' }
  }
}

// Create page revision
export async function createPageRevision(revisionData: {
  pageId: number
  title: string
  content?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  template?: string
  authorId?: string
}) {
  try {
    // Get the next revision number
    const existingRevisions = await db
      .select()
      .from(pageRevisions)
      .where(eq(pageRevisions.pageId, revisionData.pageId))
      .orderBy(desc(pageRevisions.revisionNumber))
      .limit(1)

    const nextRevisionNumber = existingRevisions.length > 0 
      ? existingRevisions[0].revisionNumber + 1 
      : 1

    const result = await db
      .insert(pageRevisions)
      .values({
        pageId: revisionData.pageId,
        title: revisionData.title,
        content: revisionData.content || null,
        excerpt: revisionData.excerpt || null,
        metaTitle: revisionData.metaTitle || null,
        metaDescription: revisionData.metaDescription || null,
        template: revisionData.template || null,
        authorId: revisionData.authorId || null,
        revisionNumber: nextRevisionNumber,
      })
      .returning()

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error creating page revision:', error)
    return { success: false, error: 'Failed to create page revision' }
  }
}

// Get page analytics
export async function getPageAnalytics(pageId: number, days: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await db
      .select()
      .from(pageAnalytics)
      .where(
        and(
          eq(pageAnalytics.pageId, pageId),
          sql`${pageAnalytics.date} >= ${startDate}`
        )
      )
      .orderBy(asc(pageAnalytics.date))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching page analytics:', error)
    return { success: false, error: 'Failed to fetch page analytics' }
  }
}

// Record page analytics
export async function recordPageAnalytics(analyticsData: {
  pageId: number
  date: Date
  views?: number
  uniqueViews?: number
  timeOnPage?: number
  bounceRate?: number
}) {
  try {
    const result = await db
      .insert(pageAnalytics)
      .values({
        pageId: analyticsData.pageId,
        date: analyticsData.date,
        views: analyticsData.views || 0,
        uniqueViews: analyticsData.uniqueViews || 0,
        timeOnPage: analyticsData.timeOnPage || 0,
        bounceRate: analyticsData.bounceRate || 0,
      })
      .returning()

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error recording page analytics:', error)
    return { success: false, error: 'Failed to record page analytics' }
  }
} 