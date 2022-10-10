import express from 'express';

import config from 'config';
import routes from './routes/ninja';
import query from './db/database';

const app = express();
const port: number = config.get('App.port');
app.use(routes);

const dbQuery = async () => {
  const { rows } = await query('SELECT * FROM ninjas', []);
  return rows.length > 0
    ? 'Database created and connected successfully.'
    : "Database doesn't work correctly. Please check configuration.";
};

app.listen(port, () => {
  const dbHealthCheck = dbQuery;
  console.log(`${dbHealthCheck} Server is listening on port ${port}...`);
});
