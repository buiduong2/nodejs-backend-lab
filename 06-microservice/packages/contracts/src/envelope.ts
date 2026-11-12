export interface MessageEnvelope<TType extends string, TPayload> {
	messageId: string
	sagaId: string
	orderId: string
	type: TType
	occurredAt: string
	payload: TPayload
}
