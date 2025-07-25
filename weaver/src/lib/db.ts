// credit https://stackoverflow.com/questions/72440961
import { Pool } from 'pg';

const pool = new Pool({
	database: import.meta.env.POSTGRES_DB || 'weaver',
	user: import.meta.env.POSTGRES_USERNAME || 'postgres',
	host: import.meta.env.POSTGRES_HOST || 'localhost',
	port: Number(import.meta.env.POSTGRES_PORT || 5432)
});

export const connectToDB = async () => await pool.connect();
