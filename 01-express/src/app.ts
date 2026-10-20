import express, { type Express, type Request, type Response } from 'express'
import { taskRouter } from './modules/tasks/task.router.ts'
import { requestLoggerv } from './middelware/log.middleware.ts'
import { errorHandler } from './middelware/error-handller.middleware.ts'
import { notFoundHandler } from './middelware/not-found.middleware.ts'

const app: Express = express()

app.use(requestLoggerv)
app.get('/', (req: Request, res: Response) => {
	res.send('Hello World!')
})

app.use(express.json())
app.use('/tasks', taskRouter)
app.use(notFoundHandler)
app.use(errorHandler)
app.listen(3000)
