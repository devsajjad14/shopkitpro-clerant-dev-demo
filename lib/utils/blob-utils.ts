/**
 * Delete all blobs in the products directory that match the given filename(s).
 * @param filenames - Array of filenames to delete (e.g., ['12345_l.jpg', '12345_m.jpg'])
 * @returns Promise<void>
 */
export async function deleteProductImagesByFilenames(filenames: string[]): Promise<void> {
  if (!filenames.length) return;
  
  try {
    const response = await fetch('/api/upload/delete-product-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filenames }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to delete product images:', error);
      return;
    }

    const result = await response.json();
    if (result.deletedCount > 0) {
      console.log(`Successfully deleted ${result.deletedCount} images:`, result.deletedFiles);
    }
  } catch (error) {
    console.error('Error calling delete product images API:', error);
  }
}

/**
 * Delete all blobs in the products directory that match a pattern (e.g., for styleId or alt images)
 * @param pattern - RegExp or string pattern to match filenames
 * @returns Promise<void>
 */
export async function deleteProductImagesByPattern(pattern: RegExp | string): Promise<void> {
  try {
    // For pattern-based deletion, we'll need to implement this differently
    // For now, we'll use a more specific approach or extend the API
    console.warn('Pattern-based deletion not yet implemented via API');
  } catch (error) {
    console.error('Error calling delete product images by pattern API:', error);
  }
} 