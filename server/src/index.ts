import './load-env.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dashboardRoutes from './routes/dashboard.js';
import clientsRoutes from './routes/clients.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import commentsRoutes from './routes/comments.js';
import filesRoutes from './routes/files.js';
import clientPortalRoutes from './routes/clientPortal.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/dashboard', dashboardRoutes);
app.use('/clients', clientsRoutes);
app.use('/projects', projectsRoutes);
app.use('/projects', tasksRoutes);
app.use('/tasks', tasksRoutes);
app.use('/tasks', commentsRoutes);
app.use('/projects', filesRoutes);
app.use('/files', filesRoutes);
app.use('/client', clientPortalRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
