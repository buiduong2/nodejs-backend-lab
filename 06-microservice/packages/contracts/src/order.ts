import { MessageEnvelope } from './envelope'

export interface OrderCompensatedEvent extends MessageEnvelope<
	'event',
	{
		orderId: string
		customerId: string
	}
> {}

export interface OrderConfirmedEvent extends MessageEnvelope<
	'event',
	{ orderId: string; customerId: string }
> {}
