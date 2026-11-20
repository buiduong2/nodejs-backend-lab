import { Hono } from 'hono'
import { validateBody } from '../../common/zvalidate/validate.js'
import { authenticationSchema } from './auth.schema.js'
import * as authService from './auth.service.js'

export const eventsRouter = new Hono().get(
	'/login',
	validateBody(authenticationSchema),
	async c => {
		const auth = c.req.valid('json')
        return c.json(await authService.login(auth));
	}
)
