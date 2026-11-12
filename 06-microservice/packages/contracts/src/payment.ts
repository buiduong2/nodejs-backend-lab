import { MessageEnvelope } from "./envelope";

export interface PaymentChargeCommand extends MessageEnvelope<
  'command',
  PaymentChargePayload
> {}

export interface PaymentChargePayload {
  orderId: string;
  items: { productId: string; quantity: number }[];
  totalAmount: string;
}

export interface PaymentChargeEvent extends MessageEnvelope<
  'event',
  { paymentId: string; success: boolean }
> {}
