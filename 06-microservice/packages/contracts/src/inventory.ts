import { MessageEnvelope } from './envelope'


export interface ReserveInventoryCommand extends MessageEnvelope<
  'command',
  ReserveInventoryPayload
> {}

export interface ReserveInventoryPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface InventoryReserveFailedEvent extends MessageEnvelope<
  'event',
  ReservationResult
> {}

export interface InventoryReservateSuccessEvent extends MessageEnvelope<
  'event',
  ReservationResult
> {}

export interface InventoryReservationEvent extends MessageEnvelope<
  'event',
  ReservationResult
> {}

export type ReservationResult =
  | {
      success: true;
      reservationId: string;
    }
  | {
      success: false;
      reason: 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND';
    };

export type ReservationSuccessResult = { success: true } & ReservationResult;
export type ReservatinFailedResult = { success: false } & ReservationResult;

export interface InventoryReleaseCommand extends MessageEnvelope<
  'command',
  ReserveInventoryPayload
> {}
export interface InventoryReleaseSuccessEvent extends MessageEnvelope<
  'event',
  { reservationId: string }
> {}