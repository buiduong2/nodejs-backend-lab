import z from 'zod'
import { eventStatus } from '../../db/schema/index.js'
import { statusValues } from '../../db/schema/event.js'

export const CreateEventSchema = z.object({
	title: z.string().max(255).nonempty(),
	description: z.string().nonempty(),
	location: z.string().max(255).nonempty(),
	startTime: z.iso
		.datetime({ offset: true })
		.transform(value => new Date(value))
})

export type CreateEventDTO = z.infer<typeof CreateEventSchema>

export const queryEventSchema = z.object({
	page: z.coerce.number().min(1).int().default(1),
	limit: z.coerce.number().min(1).int().default(10),
	status: z.enum(statusValues).optional()
})

export type EventQuery = z.infer<typeof queryEventSchema>

export const UpdateEventSchema = z
	.object({
		title: z.string().max(255).optional(),
		description: z.string().optional(),
		location: z.string().max(255).optional(),
		startTime: z.iso
			.datetime({ offset: true })
			.transform(value => new Date(value))
			.optional()
	})
	.refine(obj => Object.keys(obj).length > 0, {
		message: 'Object must contain at least one key-value pair'
	})

export const CreateTypeTicketSchema = z.object({
    name: z.string().max(255).min(1).nonempty(),
    price: z.number().positive().int(),
    quantity: z.number().positive().int()
})
