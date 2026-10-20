import { Router, type Request, type Response } from 'express'
import { responseBadRequest } from '../../helpers/index.ts'
import taskService from './task.service.ts'
import type { CreateTaskDto } from './task.types.ts'
export const taskRouter = Router()

// get By Id
taskRouter.get('/:id', async function getById(req: Request, res: Response) {
	const id = Number(req.params.id)
	if (id) {
		res.status(200).json(await taskService.findById(id))
	} else {
		responseBadRequest(res)
	}
})

// Find All
taskRouter.get('/', async function findAll(req: Request, res: Response) {
	res.status(200).json(await taskService.findAll())
})

// Create
taskRouter.post('/', async (req, res) => {
	const reqBody: unknown = req.body
	if (reqBody) {
		// validate after
		res.status(201).json(await taskService.create(reqBody as CreateTaskDto))
	} else {
		responseBadRequest(res)
	}
})

// update
taskRouter.put('/:id', async (req, res) => {
	const id = Number(req.params.id)
	const dto = req.body

	if (id && dto) {
		res.status(200).json(await taskService.update(id, dto))
	} else {
		responseBadRequest(res)
	}
})

// Delete
taskRouter.delete('/:id', async (req, res) => {
	const id = Number(req.params.id)
	if (id) {
        await taskService.deleteById(id);
		res.status(204).end();
	} else {
		responseBadRequest(res)
	}
})
