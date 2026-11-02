import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
	CreateEventSchema,
	CreateTypeTicketSchema,
	queryEventSchema,
	UpdateEventSchema
} from './events.schema.js'
import * as eventService from './events.service.js'
import {
	validateBody,
	validatePathId,
	validateQuery
} from '../../common/zvalidate/validate.js'

export const eventsRouter = new Hono()
	//GET /events?page=1&limit=10&status=PUBLISHED
	.get('/', validateQuery(queryEventSchema), async c => {
		return c.json(await eventService.findAll(c.req.valid('query')))
	})
	.get('/:id', validatePathId(), async c => {
		return c.json(await eventService.findById(c.req.valid('param').id))
	})
	.post('/', validateBody(CreateEventSchema), async c => {
		const body = c.req.valid('json')

		const event = await eventService.create(body)

		return c.json(event, 201)
	})
	.patch(
		'/:id',
		validateBody(UpdateEventSchema),
		validatePathId(),
		async c => {
			return c.json(
				await eventService.update(
					c.req.valid('param').id,
					c.req.valid('json')
				)
			)
		}
	)

	// event-type
	.post(
		'/:eventId/ticket-types',
		validateBody(CreateTypeTicketSchema),
		zValidator(
			'param',
			z.object({ eventId: z.coerce.number().positive().int() })
		),
		async c => {
			const eventId = c.req.valid('param').eventId
			const createTypeTicketDTO = c.req.valid('json')

			return c.json(
				await eventService.createTypeTicket(
					eventId,
					createTypeTicketDTO
				)
			)
		}
	)

	.get(
		'/:eventId/ticket-types',
		zValidator(
			'param',
			z.object({ eventId: z.coerce.number().positive().int() })
		),
		async c => {
			const eventId = c.req.valid('param').eventId

			return c.json(
				await eventService.findAllTicketTypesByEventId(
					eventId
				)
			)
		}
	)
