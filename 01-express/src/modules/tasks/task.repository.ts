import type { Task } from './task.types.ts'

export const tasks: Task[] = [
	{
		id: 1,
		title: 'Learn TypeScript',
		desc: 'Learn interfaces, types, generics and utility types.'
	},
	{
		id: 2,
		title: 'Learn ExpressJS',
		desc: 'Understand routing, middleware, request and response.'
	},
	{
		id: 3,
		title: 'Implement Task CRUD',
		desc: 'Build REST APIs for creating, reading, updating and deleting tasks.'
	},
	{
		id: 4,
		title: 'Integrate PostgreSQL',
		desc: 'Connect ExpressJS to PostgreSQL using node-postgres.'
	},
	{
		id: 5,
		title: 'Write API Tests',
		desc: 'Test REST endpoints using Postman and automated tests.'
	}
]

let nextId = Math.max(0, ...tasks.map(t => t.id)) + 1;

async function findAll(): Promise<Task[]> {
	return structuredClone(tasks)
}

async function findById(id: number): Promise<Task | undefined> {
	return structuredClone(tasks.find(task => task.id === id))
}

async function create(req: Omit<Task, 'id'>): Promise<Task> {
	const task: Task = {
		id: ++nextId,
		title: req.title,
		desc: req.desc
	}
	tasks.push(task)

	return structuredClone(task)
}

async function update(dto: Task): Promise<Task> {
	const existed = tasks.find(t => t.id === dto.id)
	if (existed) {
		existed.title = dto.title
		existed.desc = dto.desc
		return structuredClone(existed)
	} else {
		throw new Error('Resource not found')
	}
}

async function deleteById(id: number): Promise<void> {
	const index = tasks.findIndex(t => t.id === id)
	if (index >= 0) {
		tasks.splice(index, 1)
	} else {
		throw new Error('resource Not FOund')
	}
}

async function existById(id: number): Promise<boolean> {
	return tasks.some(t => t.id === id)
}

export default {
	findAll,
	findById,
	update,
	create,
	deleteById,
	existById
}
