import { migrate } from "./db/migrate.js";
import express from "express";
import cors from "cors";
import resourceRoutes from "./routes/resource.routes.js"
import userRoutes from "./routes/user.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js"
import exportRoutes from "./routes/export.routes.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin not allowed"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.options(/(.*)/, cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/feedbacks", feedbackRoutes);
app.use("/api/v1/export", exportRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ok: true, message: "Backend is working"});
})

app.use(errorHandler);

const PORT = 3000;

async function startServer() {
  try {
    await migrate();

    app.listen(PORT, () => {
      console.log(`Server is on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server cannot start", err);
    process.exit(1);
  }
}
startServer();