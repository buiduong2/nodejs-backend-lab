import * as schema from './schema/index.js'
import pg from 'pg'
const { Pool } = pg
import { drizzle } from 'drizzle-orm/node-postgres'

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL!
})

export const db = drizzle({ client: pool, schema });