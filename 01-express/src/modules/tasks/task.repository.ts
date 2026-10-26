import { NotFoundError } from '../../error/NotFoundError.ts'
import type { Task } from './task.types.ts'

import { pool } from '../../config/pg.config.ts'

async function findAll(): Promise<Task[]> {
	const res = await pool.query('SELECT * FROM tasks')

	return res.rows.map(row => ({ ...row, id: Number(row.id) }))
}

async function findById(id: number): Promise<Task | undefined> {
	const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])

	if (res.rowCount === 1) {
		return { ...res.rows[0], id: Number(res.rows[0].id) }
	}
	return undefined
}

async function create(req: Omit<Task, 'id'>): Promise<Task> {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const insertQuery =
			'INSERT INTO tasks(title,description) VALUES($1, $2) RETURNING *'
		const res = await client.query(insertQuery, [
			req.title,
			req.description
		])

		await client.query('COMMIT')

		if (res.rowCount === 1) {
			return { ...res.rows[0], id: res.rows[0].id } as Task
		}

		throw new Error('Insert Record not sucess')
	} catch (e) {
		await client.query('ROLLBACK')
		throw e
	} finally {
		client.release()
	}
}

async function update(dto: Task): Promise<Task> {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const updateQuery =
			'UPDATE  tasks SET title = $1 , description = $2 WHERE id = $3 RETURNING *'
		const res = await client.query(updateQuery, [
			dto.title,
			dto.description,
			dto.id
		])

		await client.query('COMMIT')

		if (res.rowCount === 1) {
			return { ...res.rows[0], id: res.rows[0].id } as Task
		}

		throw new Error('UPdate Record not sucess')
	} catch (e) {
		await client.query('ROLLBACK')
		throw e
	} finally {
		client.release()
	}
}

async function deleteById(id: number): Promise<void> {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const deletQuery = 'DELETE FROM tasks  WHERE id = $1 RETURNING *'
		const res = await client.query(deletQuery, [id])

		await client.query('COMMIT')

		if (res.rowCount === 1) {
			return
		}

		throw new Error('Delete Record not sucess')
	} catch (e) {
		await client.query('ROLLBACK')
		throw e
	} finally {
		client.release()
	}
}

async function existById(id: number): Promise<boolean> {
	const query = 'SELECT 1 FROM tasks WHERE id = $1'
	const res = await pool.query(query, [id])
	// return tasks.some(t => t.id === id)
	return res.rowCount === 1 
}

export default {
	findAll,
	findById,
	update,
	create,
	deleteById,
	existById
}
