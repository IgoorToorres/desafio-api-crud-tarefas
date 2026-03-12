import fs, { createReadStream } from "node:fs"
import { parse } from "csv-parse"
import { randomUUID } from "node:crypto"

export async function importCsv(filePath, database) {
    const parser = createReadStream(filePath).pipe(
        parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter: ";",
            bom: true
        })
    )

    let imported = 0
    let skipped = 0

    for await (const record of parser) {
        const title = record.title
        const description = record.description

        if (!title || !description) {
            skipped++
            continue
        }

        const task = {
            id: randomUUID(),
            title,
            description,
            completed: false
        }

        database.insert("tasks", task);
        imported++
    }
    return { imported, skipped }
}