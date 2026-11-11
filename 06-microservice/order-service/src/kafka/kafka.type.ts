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

export interface InventoryafiledEvent extends MessageEnvelop<
  'event',
  {
    reason: 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND';
  }
> {}

export interface InventorySuccessEvent extends MessageEnvelop<'event', {}> {}
