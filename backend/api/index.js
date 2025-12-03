import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';


import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js";


// MongoDB Connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));


const app = express();
const server = createServer(app);

// CORS Configuration (Must be on Top)
const allowedOrigins = [
   "http://localhost:5173",
   "https://hrmsf.hombrix.com",
   "https://rofgroup.co.in"
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ⚠️ ATTENDANCE ROUTES MUST COME BEFORE express.json()



// JSON/body parser must come AFTER multer routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

// Routes
app.use("/api/attendance", attendanceRoutes);
app.use('/api/auth', authRoutes);



// Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});