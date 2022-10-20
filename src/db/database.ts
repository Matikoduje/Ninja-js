import { Pool } from 'pg';
import config from 'config';

type postgresConfiguration = {
  password: string;
  user: string;
  database: string;
  dbConnectionString: string;
};

const prepareConnectionString = (): string => {
  const dbPostgres: postgresConfiguration = config.get(
    'App.postgresConfiguration'
  );
  const { user, password, database, dbConnectionString } = dbPostgres;
  const replacements: { [key: string]: string } = {
    '%USER%': user,
    '%PASSWORD%': password,
    '%DATABASE%': database
  };

  return dbConnectionString.replace(/%\w+%/g, (matched) => {
    return matched in replacements ? replacements[matched] : matched;
  });
};

const pool = new Pool({ connectionString: prepareConnectionString() });

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
