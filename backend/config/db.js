import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/reports.js";

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api", reportRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("PulsePoint API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});
