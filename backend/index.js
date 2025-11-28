require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const usersRoutes = require("./routes/users");
const userRoutes = require("./routes/user");
const articlesRoutes = require("./routes/articles");
const profilesRoutes = require("./routes/profiles");
const tagsRoutes = require("./routes/tags");

const app = express();

app.use(cors());
app.use(express.json());
// Middleware de logging détaillé (doit être après express.json())
app.use(requestLogger);

(async () => {
  try {
    console.log(`[DB] Attempting to connect to ${env} database...`);
    console.log(`[DB] Configuration:`, {
      host: process.env.PROD_DB_HOSTNAME || process.env.DEV_DB_HOSTNAME,
      database: process.env.PROD_DB_NAME || process.env.DEV_DB_NAME,
      username: process.env.PROD_DB_USERNAME || process.env.DEV_DB_USERNAME,
      dialect: process.env.PROD_DB_DIALECT || process.env.DEV_DB_DIALECT
    });
    await sequelize.sync({ alter: true });
    console.log(`[DB] ✓ Connection with ${env} database has been established successfully.`);
  } catch (error) {
    console.error(`[DB] ✗ Unable to connect to the database:`);
    console.error(`[DB] Error name: ${error.name}`);
    console.error(`[DB] Error message: ${error.message}`);
    console.error(`[DB] Full error:`, error);
  }
})();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/dist"));
} else {
  app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
}
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/tags", tagsRoutes);
app.get("/api/health", async (req, res) => {
  try {
    console.log("[HEALTH] Health check requested");
    await sequelize.authenticate();
    console.log("[HEALTH] ✓ Database connection OK");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[HEALTH] ✗ Health check failed:", error.message);
    res.status(503).json({ status: "error", message: error.message });
  }
});
app.get("*", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } }),
);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`[SERVER] ✓ Server running on http://localhost:${PORT}`);
  console.log(`[SERVER] Environment: ${env}`);
  console.log(`[SERVER] Node version: ${process.version}`);
  console.log(`[SERVER] Timestamp: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(50)}\n`);
});
