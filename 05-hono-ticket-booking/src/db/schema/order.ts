import {
	bigint,
	integer,
	pgEnum,
	pgTable,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core'
import { users } from './user.js'
import { events } from './event.js'

export enum OrderStatus {
	'PENDING' = 'PENDING',
	'PAID' = 'PAID',
	'CANCELLED' = 'CANCELLED'
}

export const statusValues = Object.values(OrderStatus) as [
	OrderStatus,
	...OrderStatus[]
]
export const statusEnum = pgEnum('order_status', statusValues)

export const orders = pgTable('orders', {
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	userId: bigint({ mode: 'number' }).references(() => users.id),
	eventId: bigint({ mode: 'number' }).references(() => events.id),
	status: statusEnum().notNull().default(OrderStatus.PENDING),
	totalAmount: bigint({ mode: 'number' }),
	createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
	updatedAt: timestamp({withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

export default orders
