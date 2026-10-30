import { bigint, integer, pgTable } from 'drizzle-orm/pg-core'
import { orders } from './order.js'
import { ticketTypes } from './ticket-type.js'

export const orderItems = pgTable('order_items', {
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	orderId: bigint({ mode: 'number' })
		.notNull()
		.references(() => orders.id),
	ticketTypeId: bigint({ mode: 'number' })
		.notNull()
		.references(() => ticketTypes.id),
	quantity: integer(),
	unitPrice: integer()
})

export default orderItems
