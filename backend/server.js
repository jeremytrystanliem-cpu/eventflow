import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import eventRoutes from "./src/routes/events.routes.js";
import taskRoutes from "./src/routes/tasks.routes.js";
import guestRoutes from "./src/routes/guests.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://eventflow-jeliem.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/guests", guestRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "EventFlow API is running!", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});