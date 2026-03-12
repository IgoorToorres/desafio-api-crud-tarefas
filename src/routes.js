import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-rout-path.js";
import { randomUUID } from "node:crypto"

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tarefas'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)
            res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tarefas'),
        handler: (req, res) => {
            const {
                title,
                description,
            } = req.body

            const task = ({
                id: randomUUID(),
                title,
                description,
                completed: false
            })

            database.insert('tasks', task)
            return res.writeHead(201).end()
        }
    },
]