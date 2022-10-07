import { Pool } from 'pg';

const connectionData = {
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
};

const pool = new Pool(connectionData);
const query = (text: string, params: any) => {
  return pool.query(text, params);
};

export default query;
