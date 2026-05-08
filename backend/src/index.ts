import { migrate } from "./db/migrate.js";
import express from "express";
import cors from "cors";
import resourceRoutes from "./routes/resource.routes.js"
import userRoutes from "./routes/user.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js"
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import exportRoutes from "./routes/export.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/export", exportRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ok: true, message: "Backend is working"});
})

app.use(errorHandler);

const PORT = 3000;


async function startServer() {
  try {
    await migrate();

    app.listen(PORT, () => {
      console.log(`Server is on http://localhost:${PORT}/api/resources`);
    });
  } catch (err) {
    console.error("Server cannot start", err);
    process.exit(1);
  }
}
startServer();