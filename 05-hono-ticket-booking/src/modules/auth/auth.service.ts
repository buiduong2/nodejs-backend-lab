import { sign, verify } from 'hono/jwt'
import type z from 'zod'
import type { authenticationSchema } from './auth.schema.js'
import { db } from '../../db/index.js'
import users from '../../db/schema/user.js'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import * as passwordEncoder from '../../common/auth/password-encoder.js'

type Payload = {
	userId: number
	role: string
}

export async function login(
	auth: z.output<typeof authenticationSchema>
): Promise<any> {
	const { username, password } = auth
	const rows = await db.select().from(users).where(eq(users.email, username))
	if (rows.length !== 1) {
		throw new HTTPException(401, { message: 'Bad credentials' })
	}

	const user = rows[0]
	if (!(await passwordEncoder.compare(auth.password, password))) {
		throw new HTTPException(401, { message: 'Bad credentials' })
	}

	const payload: Payload = {
		userId: user.id,
		role: user.role
	}

	return {
		access_token: await sign(payload, process.env.JWT_SECRET!, 'HS256')
	}
}

export async function register(auth: z.output<typeof authenticationSchema>) {
	const { username, password } = auth

	await db.select("1").from(users).where(eq(users.email, username))
}
