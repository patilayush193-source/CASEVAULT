import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.routes';
import slidesRoutes from './routes/slides.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ─── CORS ────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── Body Parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Static Files ────────────────────────────────────────────────────
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/api/uploads', express.static(uploadsPath));

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/slides', slidesRoutes);

// ─── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CaseVault API running on http://localhost:${PORT}`);
});

export default app;
