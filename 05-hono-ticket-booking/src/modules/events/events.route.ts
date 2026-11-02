import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
	CreateEventSchema,
	queryEventSchema,
	UpdateEventSchema
} from './events.schema.js'
import * as eventService from './events.service.js'

export const eventsRouter = new Hono()
	//GET /events?page=1&limit=10&status=PUBLISHED
	.get('/', zValidator('query', queryEventSchema), async c => {
		return c.json(await eventService.findAll(c.req.valid('query')))
	})
	.get(
		'/:id',
		zValidator(
			'param',
			z.object({ id: z.coerce.number().int().positive() })
		),
		async c => {
			return c.json(await eventService.findById(c.req.valid('param').id))
		}
	)
	.post('/', zValidator('json', CreateEventSchema), async c => {
		const body = c.req.valid('json')

		const event = await eventService.create(body)

		return c.json(event, 201)
	})
	.patch(
		'/:id',
		zValidator('json', UpdateEventSchema),
		zValidator(
			'param',
			z.object({ id: z.coerce.number().int().positive() })
		),
		async c => {
			return c.json(
				await eventService.update(
					c.req.valid('param').id,
					c.req.valid('json')
				)
			)
		}
	)
