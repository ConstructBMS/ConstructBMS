import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { analyticsRoutes } from './routes/analytics';
import { authRoutes } from './routes/auth';
import { clientRoutes } from './routes/clients';
import { moduleRoutes } from './routes/modules';
import { projectRoutes } from './routes/projects';
import { roleRoutes } from './routes/roles';
import stickyNotesRoutes from './routes/stickyNotes';
import { taskRoutes } from './routes/tasks';
import { userRoutes } from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ConstructBMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sticky-notes', stickyNotesRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ConstructBMS API server running on port ${PORT}`);

  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
