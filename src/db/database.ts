import { Pool } from 'pg';
import config from 'config';

const dbConfig: object = config.get('App.database');

const pool = new Pool(dbConfig);
const query = (text: string, params: any) => {
  return pool.query(text, params);
};

export default query;
