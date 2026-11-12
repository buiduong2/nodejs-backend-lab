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

export interface InventoryReservationEvent extends MessageEnvelop<
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

export interface InventoryReleaseCommand extends MessageEnvelop<
  'command',
  ReserveInventoryPayload
> {}
export interface InventoryReleaseSuccessEvent extends MessageEnvelop<
  'event',
  { reservationId: string }
> {}

// ==== Payment
export interface PaymentChargeCommand extends MessageEnvelop<
  'command',
  PaymentChargePayload
> {}

export interface PaymentChargePayload {
  orderId: string;
  items: { productId: string; quantity: number }[];
  totalAmount: string;
}

export interface PaymentChargeEvent extends MessageEnvelop<
  'event',
  { paymentId: string; success: boolean }
> {}

// ==== Order Event
export interface OrderCompensatedEvent extends MessageEnvelop<
  'event',
  {
    orderId: string;
    customerId: string;
  }
> {}

export interface OrderConfirmedEvent extends MessageEnvelop<
  'event',
  { orderId: string; customerId: string }
> {}
