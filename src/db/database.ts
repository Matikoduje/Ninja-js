import { Pool } from 'pg';
import config from 'config';

type postgresConfiguration = {
  host: string;
  password: string;
  user: string;
  database: string;
  port: number;
};

const createConnectionString = (): string => {
  const dbPostgres: postgresConfiguration = config.get(
    'App.postgresConfiguration'
  );
  const { user, password, host, port, database } = dbPostgres;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

const pool = new Pool({ connectionString: createConnectionString() });

const query = (text: string, params: any) => {
  return pool.query(text, params);
};

const dbCheck = async () => {
  try {
    const { rows } = await query('SELECT * FROM testSeed', []);
    return rows.length > 0
      ? 'Database created and connected successfully.'
      : "Database seed doesn't work correctly.";
  } catch (error) {
    throw new Error("Can't connect to database");
  }
};

export { dbCheck, query };
export default query;
