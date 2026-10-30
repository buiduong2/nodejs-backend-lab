import {
	pgTable,
	bigint,
	varchar,
	timestamp,
	pgEnum,
	text
} from 'drizzle-orm/pg-core'

export enum EventStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	CANCELLED = 'CANCELLED'
}

export const statusValues = Object.values(EventStatus) as [
	EventStatus,
	...EventStatus[]
]
export const statusEnum = pgEnum('event_status', statusValues)

export const events = pgTable('events', {
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	location: varchar({ length: 255 }),
	startTime: timestamp({ withTimezone: true }),
	status: statusEnum('status').notNull().default(EventStatus.DRAFT),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

export default events
