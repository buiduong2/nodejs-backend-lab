import z from 'zod'

export const CreateEventSchema = z.object({
	title: z.string().max(255).nonempty(),
	description: z.string().nonempty(),
	location: z.string().max(255).nonempty(),
	startTime: z.iso
		.datetime({ offset: true })
		.transform(value => new Date(value))
})

export type CreateEventDTO = z.infer<typeof CreateEventSchema>
