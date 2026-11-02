import { eq } from 'drizzle-orm'
import events from '../../db/schema/event.js'
import users from '../../db/schema/user.js'
import { db } from '../../index.js'
import type { Page } from '../../types/page.types.js'

import type { CreateEventDTO, EventQuery } from './events.schema.js'
import { HTTPException } from 'hono/http-exception'
type Event = typeof events.$inferSelect

export async function create(dto: CreateEventDTO) {
	const result = await db
		.insert(events)
		.values({
			...dto
		})
		.returning()

	return result
}

export async function findAll(query: EventQuery): Promise<Page<Event>> {
	const { page, limit, status } = query

	const [result, count] = await Promise.all([
		db
			.select()
			.from(events)
			.where(status ? eq(events.status, status) : undefined)
			.limit(limit)
			.offset(limit * (page - 1)),
		db.$count(events, status ? eq(events.status, status) : undefined)
	])

	return {
		data: result,
		limit,
		page,
		total: count,
		totalPages: Math.ceil(count / limit)
	}
}
export async function findById(id: number): Promise<Event> {
	const result = await db.select().from(events).where(eq(events.id, id))
	if (result.length !== 1) {
		throw new HTTPException(404, { message: 'Resource Not found' })
	}

	return result[0]
}
export async function update(
	id: number,
	dto: {
		title?: string | undefined
		description?: string | undefined
		location?: string | undefined
		startTime?: Date | undefined
	}
): Promise<Event> {
	const result = await db
		.update(events)
		.set(dto)
		.where(eq(events.id, id))
		.returning()

	if (result.length !== 1) {
		throw new HTTPException(404, { message: 'Resource Not found' })
	}

	return result[0]
}
