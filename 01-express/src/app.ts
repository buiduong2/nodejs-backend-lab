import express, { type Express, type Request, type Response } from 'express'
import { taskRouter } from './modules/tasks/task.router.ts'

const app: Express = express()

app.get('/', (req: Request, res: Response) => {
	res.send('Hello World!')
})


app.use(express.json())
app.use('/tasks', taskRouter)
app.listen(3000)
