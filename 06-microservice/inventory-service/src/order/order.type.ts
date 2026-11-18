import { ReservationResult } from '@saga/contracts';
import { Product } from '../product/product.entity';

export type ReserveInventoryOutcome =
  | {
      duplicate: true;
    }
  | { duplicate: false; result: ReservationResult };

export type ValidateResult =
  | {
      success: false;
      reason: 'PRODUCT_NOT_FOUND' | 'OUT_OF_STOCK';
    }
  | {
      success: true;
      products: Product[];
    };
