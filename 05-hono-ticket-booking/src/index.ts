import 'dotenv/config'
import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { eventsRouter } from './modules/events/events.route.js'
import { errorHandler, notFoundHandler } from './common/errors/error-handler.js'

const app = new Hono()

app.get('/', c => {
	return c.text('Hello Hono!')
})

app.route('/events', eventsRouter)

app.onError(errorHandler)
app.notFound(notFoundHandler)

serve(
	{
		fetch: app.fetch,
		port: 3000
	},
	info => {
		console.log(`Server is running on http://localhost:${info.port}`)
	}
)
