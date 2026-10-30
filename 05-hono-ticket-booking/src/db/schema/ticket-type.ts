import {
	bigint,
	integer,
	pgTable,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core'
import { events } from './event.js'

export const ticketTypes = pgTable('ticket_types', {
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	eventId: bigint({ mode: 'number' }).references(() => events.id),
	name: varchar({ length: 255 }),
	price: integer(),
	quantity: integer(),
	reservedQuantity: integer().notNull().default(0),
	soldQuantity: integer().notNull().default(0),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

export default ticketTypes
