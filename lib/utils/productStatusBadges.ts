export type ProductStatusBadge = {
  label: string;
  type: 'sale' | 'backorder' | 'stock' | 'outofstock';
};

export function getProductStatusBadges(item: {
  onSale?: string;
  continueSellingOutOfStock?: boolean;
  quantityAvailable?: number;
  variationStock?: number;
  isVariationSelected?: boolean;
  isVariationOutOfStock?: boolean;
}): ProductStatusBadge[] {
  const badges: ProductStatusBadge[] = [];
  if (item.onSale === 'Y') badges.push({ label: 'On Sale', type: 'sale' });
  if (item.isVariationSelected) {
    if (!item.isVariationOutOfStock) {
      badges.push({ label: 'In Stock', type: 'stock' });
    } else if (item.isVariationOutOfStock && item.continueSellingOutOfStock) {
      badges.push({ label: 'Backorder Available', type: 'backorder' });
    } else if (item.isVariationOutOfStock && !item.continueSellingOutOfStock) {
      badges.push({ label: 'Out of Stock', type: 'outofstock' });
    }
  } else {
    if (item.quantityAvailable && item.quantityAvailable > 0) {
      badges.push({ label: 'In Stock', type: 'stock' });
    } else if ((!item.quantityAvailable || item.quantityAvailable <= 0) && item.continueSellingOutOfStock) {
      badges.push({ label: 'Backorder Available', type: 'backorder' });
    } else if ((!item.quantityAvailable || item.quantityAvailable <= 0) && !item.continueSellingOutOfStock) {
      badges.push({ label: 'Out of Stock', type: 'outofstock' });
    }
  }
  return badges;
} 