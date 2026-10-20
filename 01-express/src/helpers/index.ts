import type { Response } from 'express'

export function responseBadRequest(res: Response, msg?: string) {
	res.status(400).json({ message: msg ?? 'Bad request' })
}
