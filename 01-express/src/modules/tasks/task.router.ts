import { Router, type Request, type Response } from 'express'
import { BadRequestError } from '../../error/BadRequestError.ts'
import taskService from './task.service.ts'
import type { CreateTaskDto, Task, UpdateTaskDto } from './task.types.ts'
import { containField, isNotNull, isTypeof } from '../../helpers/validate.ts'
import { notFoundHandler } from '../../middelware/not-found.middleware.ts'

export const taskRouter = Router()

// get By Id
taskRouter.get('/:id', async function getById(req: Request, res: Response) {
	const id = Number(req.params.id)
	if (!Number.isSafeInteger(id) || id <= 0) {
		throw new BadRequestError('ID must be a positive integer')
	}
	res.status(200).json(await taskService.findById(id))
})

// Find All
taskRouter.get('/', async function findAll(req: Request, res: Response) {
	res.status(200).json(await taskService.findAll())
})

// Create
taskRouter.post('/', async (req, res) => {
	const reqBody: any = req.body

	if (!isTypeof(reqBody, 'object')) {
		throw new BadRequestError('Request body must be an object')
	}
	if (!containField(reqBody , 'title', 'string')) {
		throw new BadRequestError('Title is missing')
	}
	if (!containField(reqBody, 'desc', 'string')) {
		throw new BadRequestError('Desc is missing')
	}

	res.status(201).json(await taskService.create(reqBody as CreateTaskDto))
})

// update
taskRouter.put('/:id', async (req, res) => {
	const id = Number(req.params.id)
	const dto: UpdateTaskDto = req.body

	if (!Number.isSafeInteger(id) || id <= 0) {
		throw new BadRequestError('ID must be a positive integer')
	}

	if (!isTypeof(dto, 'object')) {
		throw new BadRequestError('Request body must be an object')
	}
	if (!containField(dto, 'title', 'string')) {
		throw new BadRequestError('Title is missing')
	}
	if (!containField(dto, 'desc', 'string')) {
		throw new BadRequestError('Desc is missing')
	}
	res.status(200).json(await taskService.update(id, dto))
})

// Delete
taskRouter.delete('/:id', async (req, res) => {
	const id = Number(req.params.id)
	if (!Number.isSafeInteger(id) || id <= 0) {
		throw new BadRequestError('ID must be a positive integer')
	}
	await taskService.deleteById(id)
	res.status(204).end()
})

taskRouter.use(notFoundHandler)
