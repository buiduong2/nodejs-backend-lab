import type { CreateTaskDto, Task, UpdateTaskDto } from './task.types.ts'
import taskRepository from './task.repository.ts'

async function findAll(): Promise<Task[]> {
	return taskRepository.findAll()
}

async function findById(id: number): Promise<Task> {
	const task = await taskRepository.findById(id)
	if (!task) {
		throw new Error('Resource not found')
	}

	return task
}

async function create(req: CreateTaskDto): Promise<Task> {
	const newTask = {
		title: req.title,
		desc: req.desc
	}

	return taskRepository.create(newTask)
}

async function update(id: number, dto: UpdateTaskDto): Promise<Task> {
	const oldTask = await taskRepository.findById(id)
	if (oldTask) {
		oldTask.title = dto.title
		oldTask.desc = dto.desc

		return taskRepository.update(oldTask)
	}

	throw new Error('resource not found')
}

async function deleteById(id: number): Promise<void> {
	if (await taskRepository.existById(id)) {
		return taskRepository.deleteById(id)
	}
	throw new Error('resource not found')
}

export default {
	findAll,
	findById,
	create,
	update,
	deleteById
}
