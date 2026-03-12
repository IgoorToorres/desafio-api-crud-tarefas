import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-rout-path.js";
import { randomUUID } from "node:crypto"
import multer from "multer"
import { importCsv } from "./utils/import-csv.js";

const database = new Database()
const upload = multer({dest: "/tmp"})


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
            return res.writeHead(201).end(JSON.stringify({message: "Tarefa criado com sucesso"}))
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tarefas/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const {
                title,
                description,
                completed
            } = req.body

            database.update('tasks', id, { title, description, completed })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tarefas/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const {completed} = req.body

            database.updatePartial('tasks', id, {completed})
            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tarefas/:id'),
        handler: (req, res) => {
            const { id } = req.params
            database.delete('tasks', id)
            return res.writeHead(204).end()
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tarefas/import'),
        handler: (req, res) => {
            upload.single("file")(req, res, async err => {
                if(err){
                    return res.writeHead(400).end()
                }

                if(!req.file){
                    return res
                        .writeHead(400, { "Content-Type": "application/json" })
                        .end(JSON.stringify({message: "Arquivo não enviado"}))
                }

                const result = await importCsv(req.file.path, database);

                return res
                    .writeHead(201)
                    .end(JSON.stringify(result))
            })
        }
    },

]