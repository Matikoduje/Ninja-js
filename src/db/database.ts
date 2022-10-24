import { Pool } from 'pg';
import config from 'config';

const postgresConnectionString: string = config.get(
  'App.postgresConfiguration.postgresConnectionString'
);

const pool = new Pool({
  connectionString: postgresConnectionString
});

const query = (text: string, params: any) => {
  return pool.query(text, params);
};

const dbCheck = async () => {
  try {
    const { rows } = await query('SELECT * FROM users', []);
    return rows.length > 0
      ? 'Database created and connected successfully.'
      : "Database seed doesn't work correctly.";
  } catch (error) {
    throw new Error("Can't connect to database");
  }
};

export { dbCheck, query };
export default query;
