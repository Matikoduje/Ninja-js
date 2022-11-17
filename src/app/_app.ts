import express from 'express';
import bodyParser from 'body-parser';
import versionRoutes from '../routes/version';
import userRoutes from '../routes/user';
import authRoutes from '../routes/auth';
import capsulesRoutes from '../routes/capsules';

import { appErrorRequestHandler } from '../handlers/error-handler';

const app = express();
app.use(bodyParser.json());

app.use(versionRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use(capsulesRoutes);
app.use(appErrorRequestHandler);

export default app;
