import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eventsRouter } from './modules/events/events.route.js'
import pg from 'pg'
import 'dotenv/config'
import * as schema from './db/schema/index.js'
const { Pool } = pg

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL!
})

export const db = drizzle({ client: pool, schema })
const app = new Hono()

app.get('/', c => {
	return c.text('Hello Hono!')
})

app.route('/events', eventsRouter)

serve(
	{
		fetch: app.fetch,
		port: 3000
	},
	info => {
		console.log(`Server is running on http://localhost:${info.port}`)
	}
)
