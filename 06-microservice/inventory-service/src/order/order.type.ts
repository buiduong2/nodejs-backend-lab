export interface MessageEnvelop<TType extends string, TPayload> {
  messsageId: string;
  sagaId: string;
  orderId: string;
  type: TType;
  occurredAt: string;
  payload: TPayload;
}

export interface ReserveInventoryCommand extends MessageEnvelop<
  'command',
  ReserveInventoryPayload
> {}

export interface ReserveInventoryPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const INVENTORY_RESERVE_COMMAND = 'order.inventory.reserve';
export const INVENTORY_RESERVE_EVENT = 'order.inventory.event';
export interface InventoryReserveFailedEvent extends MessageEnvelop<
  'event',
  ReservationResult
> {}

export interface InventoryReservateSuccessEvent extends MessageEnvelop<
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

export type ReservationSuccessResult = {sucess: true} & ReservationResult;