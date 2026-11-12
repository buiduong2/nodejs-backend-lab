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

export type ReservationSuccessResult = { sucess: true } & ReservationResult;

export interface InventoryReleaseSuccessEvent extends MessageEnvelop<
  'event',
  { reservationId: string }
> {}
