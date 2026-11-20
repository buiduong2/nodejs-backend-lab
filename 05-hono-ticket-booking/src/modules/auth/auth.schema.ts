import z from 'zod'

export const authenticationSchema = z.object({
	username: z.string(),
	password: z.string()
})

export type AuthenticationDTO = z.infer<typeof authenticationSchema>
