import express from 'express';

import config from 'config';
import routes from './routes/ninja';

const app = express();
const port: number = config.get('App.port');
app.use(routes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
