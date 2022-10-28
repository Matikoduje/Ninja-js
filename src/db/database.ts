import { Pool, PoolClient, QueryResult } from 'pg';
import config from 'config';
import { StatusCodeError } from '../helpers/custom-errors';

const postgresConnectionString: string = config.get(
  'App.postgresConfiguration.postgresConnectionString'
);

const pool = new Pool({
  connectionString: postgresConnectionString
});

export const query = (text: string, params: any): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

export const client = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const dbCheck = async (): Promise<string> => {
  try {
    const { rows } = await query('SELECT * FROM users', []);
    return rows.length > 0
      ? 'Database created and connected successfully.'
      : "Database seed doesn't work correctly.";
  } catch (err) {
    throw new Error("Can't connect to database");
  }
};

export const getXmin = async (
  tableName: string,
  primaryKeyColumn: string,
  recordId: number
): Promise<number> => {
  const getXminQuery = `Select xmin from ${tableName} where ${primaryKeyColumn}=$1`;
  const { rows } = await query(getXminQuery, [recordId]);
  if (rows.length === 0) {
    throw new StatusCodeError('Record not found.', 404);
  }
  return rows[0].xmin;
};
