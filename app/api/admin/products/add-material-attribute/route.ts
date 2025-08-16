import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attributes, attributeValues, productAttributes, variantAttributes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { styleId, materialValues } = await request.json()
    
    if (!styleId || !materialValues || !Array.isArray(materialValues)) {
      return NextResponse.json({ 
        success: false, 
        error: 'StyleId and materialValues array are required' 
      }, { status: 400 })
    }
    
    console.log('Adding Material attribute to product:', styleId, 'with values:', materialValues)
    
    // Get the product
    const [product] = await db.select({ id: db.products.id }).from(db.products).where(eq(db.products.styleId, parseInt(styleId)))
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    
    // Check if Material attribute already exists
    let [existingAttribute] = await db.select()
      .from(attributes)
      .where(eq(attributes.name, 'Material'))
      .limit(1)
    
    let attributeId: string
    if (existingAttribute) {
      attributeId = existingAttribute.id
      console.log('Using existing Material attribute:', attributeId)
    } else {
      // Create new Material attribute
      const [newAttribute] = await db.insert(attributes).values({
        name: 'Material',
        display: 'Material',
        status: 'active'
      }).returning()
      attributeId = newAttribute.id
      console.log('Created new Material attribute:', attributeId)
    }
    
    // Create attribute values and product attributes
    const attributeValueIds = []
    for (const value of materialValues) {
      // Check if attribute value already exists
      let [existingValue] = await db.select()
        .from(attributeValues)
        .where(and(
          eq(attributeValues.attributeId, attributeId),
          eq(attributeValues.value, value)
        ))
        .limit(1)
      
      let attributeValueId: string
      if (existingValue) {
        attributeValueId = existingValue.id
        console.log('Using existing Material value:', value, attributeValueId)
      } else {
        // Create new attribute value
        const [newValue] = await db.insert(attributeValues).values({
          attributeId: attributeId,
          value: value
        }).returning()
        attributeValueId = newValue.id
        console.log('Created new Material value:', value, attributeValueId)
      }
      
      attributeValueIds.push(attributeValueId)
      
      // Create product attribute
      await db.insert(productAttributes).values({
        productId: product.id,
        attributeId: attributeId,
        attributeValueId: attributeValueId
      })
    }
    
    console.log('Successfully added Material attribute to product')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Material attribute added successfully',
      attributeId,
      attributeValueIds
    })
  } catch (error) {
    console.error('Error adding Material attribute:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 