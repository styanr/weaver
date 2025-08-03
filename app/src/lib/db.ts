// credit https://stackoverflow.com/questions/72440961
import { Pool } from 'pg';

import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
} from '$env/static/private';

const pool = new Pool({
  database: POSTGRES_DB || 'weaver',
  user: POSTGRES_USERNAME || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  password: POSTGRES_PASSWORD || '',
  port: Number(POSTGRES_PORT || 5432),
});

export const connectToDB = async () => await pool.connect();
