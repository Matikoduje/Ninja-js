import express from 'express';

import trainingRoutes from './routes/training';

const app = express();
const port = 8080;
app.use(trainingRoutes);

app.listen(port);
