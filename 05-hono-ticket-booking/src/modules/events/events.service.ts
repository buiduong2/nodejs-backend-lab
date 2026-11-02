import { eq } from 'drizzle-orm'
import events, { EventStatus } from '../../db/schema/event.js'
import users from '../../db/schema/user.js'
import { db } from '../../db/index.js'
import type { Page } from '../../types/page.types.js'
import type {
	CreateEventDTO,
	EventQuery,
	UpdateEventSchema
} from './events.schema.js'
import { HTTPException } from 'hono/http-exception'
import ticketTypes, { type TicketType } from '../../db/schema/ticket-type.js'
import type z from 'zod'
type Event = typeof events.$inferSelect

type EventDetail = Event & { ticketTypes: TicketType[] }
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
export async function findById(id: number): Promise<EventDetail> {
	const rows = await db
		.select()
		.from(events)
		.leftJoin(ticketTypes, eq(events.id, ticketTypes.eventId))
		.where(eq(events.id, id))
		.orderBy(events.id)
	if (rows.length === 0) {
		throw new HTTPException(404, { message: 'Resource Not found' })
	}

	return {
		...rows[0].events,
		ticketTypes: rows
			.map(row => row.ticket_types)
			.filter((ticket): ticket is TicketType => ticket !== null)
	}
}

/**
 *
 * @deprecated
 */
function mapEventWithTicketTypes(
	result: {
		events: {
			id: number
			title: string
			description: string | null
			location: string | null
			startTime: Date | null
			status: EventStatus
			createdAt: Date
			updatedAt: Date
		}
		ticket_types: {
			id: number
			eventId: number | null
			name: string | null
			price: number | null
			quantity: number | null
			reservedQuantity: number
			soldQuantity: number
			createdAt: Date
			updatedAt: Date
		} | null
	}[],
	id: number
) {
	const mapEvent = new Map(
		result.map(rs => [
			rs.events.id,
			{ ...rs.events, ticketTypes: [] as TicketType[] }
		])
	)

	result
		.map(rs => rs.ticket_types)
		.forEach(ticketType => {
			if (ticketType === null) {
				return
			}
			if (mapEvent.has(ticketType.eventId!)) {
				const event = mapEvent.get(ticketType.eventId!)
				event?.ticketTypes.push(ticketType)
			}
		})

	return mapEvent.get(id)!
}

export async function update(
	id: number,
	dto: z.output<typeof UpdateEventSchema>
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

export async function createTypeTicket(
	eventId: number,
	createTypeTicketDTO: { name: string; price: number; quantity: number }
): Promise<TicketType> {
	const typeTicket = await db
		.insert(ticketTypes)
		.values({
			eventId,
			...createTypeTicketDTO
		})
		.returning()

	if (typeTicket.length !== 1) {
		throw new HTTPException(500, { message: 'Internal Error' })
	}

	return typeTicket[0]
}

export async function findAllTicketTypesByEventId(
	eventId: number
): Promise<TicketType[]> {
	return db.select().from(ticketTypes).where(eq(ticketTypes.eventId, eventId))
}
