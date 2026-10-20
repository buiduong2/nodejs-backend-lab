export interface Task {
	id: number
	title: string
	desc: string
}

export interface CreateTaskDto {
	title: string
	desc: string
}

export interface UpdateTaskDto {
	title: string
	desc: string
}
