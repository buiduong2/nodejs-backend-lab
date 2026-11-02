import { zValidator } from '@hono/zod-validator'
import { z, type ZodType } from 'zod'
import { validateErrorHandle } from '../errors/validate-error-handler.js'

export const validateBody = <T extends ZodType>(schema: T) =>
	zValidator('json', schema, validateErrorHandle)
export const validatePathId = () =>
	zValidator(
		'param',
		z.object({ id: z.coerce.number().int().positive() }),
		validateErrorHandle
	)

export const validateQuery = <T extends ZodType>(schema: T) =>
	zValidator('query', schema, validateErrorHandle)
