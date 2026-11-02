import type { ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) {
		return c.json(
			{
				success: false,
				error: {
					message: err.message,
					status: err.status
				}
			},
			{ status: err.status }
		)
	}

	console.log(err)
	return c.json(
		{
			success: false,
			error: { message: 'Internal Server Error', status: 500 }
		},
		{ status: 500 }
	)
}

export const notFoundHandler: NotFoundHandler = c => {
	return c.json(
		{
			success: false,
			error: {
				message: 'route not found',
				status: 404
			}
		},
		{ status: 404 }
	)
}
