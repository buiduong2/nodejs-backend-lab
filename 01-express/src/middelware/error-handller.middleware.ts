import type { ErrorRequestHandler } from 'express'
import { BadRequestError } from '../error/BadRequestError.ts'
import { NotFoundError } from '../error/NotFoundError.ts'
import type { ErrorDetail } from '../error/error-detail.types.ts'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	let errorDetail: ErrorDetail | undefined = undefined
	if (err instanceof BadRequestError) {
		errorDetail = {
			type: 'Bad_REQUEST',
			message: err.message,
			statusCode: 400
		}
	} else if (err instanceof NotFoundError) {
		errorDetail = {
			type: 'NOT_FOUND',
			message: err.message,
			statusCode: 404
		}
	} else if (err instanceof Error) {
		errorDetail = {
			type: 'SERVER_ERROR',
			message: 'Server error',
			statusCode: 500
		}
	}

	if (errorDetail) {
		res.status(errorDetail.statusCode).json(errorDetail)
        return;
	}
	next(err)
}
