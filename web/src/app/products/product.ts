export type Category =
  | 'SKINCARE'
  | 'MAKEUP'
  | 'HAIRCARE'
  | 'FRAGRANCE'
  | 'BODY_CARE'
  | 'TOOLS'
  | 'OTHER';

export type ContentStatus = 'NOT_STARTED' | 'FILMED' | 'POSTED';

export type ExpiryStatus = 'NO_DATE' | 'OK' | 'EXPIRING_SOON' | 'EXPIRED';

/** What we send to the API when creating or updating a product. */
export interface ProductRequest {
  name: string;
  brand: string;
  category: Category;
  shade: string | null;
  receivedDate: string; // "YYYY-MM-DD"
  openedDate: string | null;
  paoMonths: number | null;
  expiryDate: string | null;
  contentStatus: ContentStatus;
  notes: string | null;
}

/** What the API sends back: the saved fields plus the calculated expiry info. */
export interface Product extends ProductRequest {
  id: number;
  effectiveExpiry: string | null;
  daysUntilExpiry: number | null;
  expiryStatus: ExpiryStatus;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'HAIRCARE', label: 'Haircare' },
  { value: 'FRAGRANCE', label: 'Fragrance' },
  { value: 'BODY_CARE', label: 'Body care' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'OTHER', label: 'Other' },
];

export const CONTENT_STATUSES: { value: ContentStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Needs content' },
  { value: 'FILMED', label: 'Filmed' },
  { value: 'POSTED', label: 'Posted' },
];

/** Today's date in the user's own time zone, as "YYYY-MM-DD". */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Strips the calculated fields so a Product can be sent back as a request. */
export function toRequest(product: Product): ProductRequest {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    shade: product.shade,
    receivedDate: product.receivedDate,
    openedDate: product.openedDate,
    paoMonths: product.paoMonths,
    expiryDate: product.expiryDate,
    contentStatus: product.contentStatus,
    notes: product.notes,
  };
}