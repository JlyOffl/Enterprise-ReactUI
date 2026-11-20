import { round2, TAX_RATE } from '../../api/mock/data';
import type { Product } from '../models';

export interface PricedLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockWarning: boolean;
}

export interface OrderQuote {
  lines: PricedLine[];
  subtotal: number;
  volumeDiscount: number;
  discount: number;
  tax: number;
  total: number;
  taxRate: number;
  warnings: string[];
}

/**
 * Business rules for order pricing (registered in IoC by the orders module).
 * Pure and platform independent, so web and mobile always quote the same totals.
 */
export class OrderPricingService {
  readonly taxRate = TAX_RATE;
  readonly volumeThreshold = 10_000;
  readonly volumeDiscountPct = 2;

  quote(
    lines: Array<{ productId: string; quantity: number }>,
    products: Product[],
    discountPct: number,
  ): OrderQuote {
    const warnings: string[] = [];
    const priced: PricedLine[] = lines
      .filter((l) => l.productId)
      .map((l) => {
        const p = products.find((x) => x.id === l.productId);
        const quantity = Number.isFinite(l.quantity) ? l.quantity : 0;
        const stockWarning = !!p && quantity > p.stock;
        if (stockWarning) warnings.push(`${p!.name}: only ${p!.stock} in stock`);
        return {
          productId: l.productId,
          productName: p?.name ?? '—',
          quantity,
          unitPrice: p?.price ?? 0,
          lineTotal: round2(quantity * (p?.price ?? 0)),
          stockWarning,
        };
      });
    const subtotal = round2(priced.reduce((s, l) => s + l.lineTotal, 0));
    const volumeDiscount = subtotal >= this.volumeThreshold ? round2(subtotal * (this.volumeDiscountPct / 100)) : 0;
    const discount = round2(subtotal * ((discountPct || 0) / 100) + volumeDiscount);
    const tax = round2((subtotal - discount) * this.taxRate);
    return {
      lines: priced,
      subtotal,
      volumeDiscount,
      discount,
      tax,
      total: round2(subtotal - discount + tax),
      taxRate: this.taxRate,
      warnings,
    };
  }

  /** Approval policy: high value or high priority orders need a manager. */
  requiresApproval(total: number, priority: string): boolean {
    return total > 25_000 || priority === 'high';
  }
}
