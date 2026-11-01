import events from '../../db/schema/event.js'
import users from '../../db/schema/user.js'
import { db } from '../../index.js'

import {} from 'drizzle-orm/pg-core'
import type { CreateEventDTO } from './events.schema.js'
export async function create(dto: CreateEventDTO) {
	const userId = 1

	const result = await db
		.insert(events)
		.values({
			...dto
            
		})
		.returning()

	return result
}
