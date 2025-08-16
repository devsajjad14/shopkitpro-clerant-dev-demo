import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id: resolvedParams.id },
      include: {
        values: {
          select: {
            value: true,
          },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ attribute })
  } catch (error) {
    console.error('Error fetching attribute:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attribute' },
      { status: 500 }
    )
  }
}
