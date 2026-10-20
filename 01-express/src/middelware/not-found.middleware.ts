import type { RequestHandler } from 'express'
import { NotFoundError } from '../error/NotFoundError.ts'

export const notFoundHandler: RequestHandler = (req, res, next) => {
	next(new NotFoundError('route not found'))
}
