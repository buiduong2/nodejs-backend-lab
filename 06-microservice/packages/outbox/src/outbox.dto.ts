export class OutboxCreateDTO {
	topic: string
	messageKey: string
	payload: any
}
