import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreateEventSchema } from './events.schema.js'
import * as eventService from './events.service.js'

export const eventsRouter = new Hono()
	.get('/', c => {
		return c.json({ message: 'List events' })
	})
	.post('/', zValidator('json', CreateEventSchema), async c => {
		const body = c.req.valid('json')

		const event = await eventService.create(body)

		return c.json(event, 201)
	})
