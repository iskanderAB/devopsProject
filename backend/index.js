require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const config = require("./config/config.js")[env];
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

// Prometheus metrics
const promClient = require("prom-client");
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();

// Collecter les métriques par défaut (CPU, mémoire, etc.)
collectDefaultMetrics({ register });

// Métriques personnalisées
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const dbConnectionStatus = new promClient.Gauge({
  name: "db_connection_status",
  help: "Database connection status (1 = connected, 0 = disconnected)",
  registers: [register],
});

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

// Middleware pour collecter les métriques HTTP
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
});

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
    dbConnectionStatus.set(1); // Connexion réussie
  } catch (error) {
    console.error(`[DB] ✗ Unable to connect to the database:`);
    console.error(`[DB] Error name: ${error.name}`);
    console.error(`[DB] Error message: ${error.message}`);
    console.error(`[DB] Full error:`, error);
    dbConnectionStatus.set(0); // Connexion échouée
  }
})();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/dist"));
} else {
  app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
}

// Endpoint Prometheus metrics (doit être avant les autres routes pour éviter l'interception)
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
});

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
    dbConnectionStatus.set(1);
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[HEALTH] ✗ Health check failed:", error.message);
    dbConnectionStatus.set(0);
    res.status(503).json({ status: "error", message: error.message });
  }
});
app.get("/api/debug/status", async (req, res) => {
  try {
    console.log("[DEBUG] Status check requested");
    
    let dbStatus = "disconnected";
    let dbError = null;
    try {
      await sequelize.authenticate();
      dbStatus = "connected";
      console.log("[DEBUG] ✓ Database connection verified");
    } catch (error) {
      dbError = {
        name: error.name,
        message: error.message,
        code: error.code
      };
      console.error("[DEBUG] ✗ Database connection failed:", error.message);
    }
    
    const status = {
      server: {
        status: "running",
        environment: env,
        nodeVersion: process.version,
        port: PORT,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      database: {
        status: dbStatus,
        config: {
          host: config.host || process.env.PROD_DB_HOSTNAME || process.env.DEV_DB_HOSTNAME,
          database: config.database || process.env.PROD_DB_NAME || process.env.DEV_DB_NAME,
          username: config.username || process.env.PROD_DB_USERNAME || process.env.DEV_DB_USERNAME,
          dialect: config.dialect || process.env.PROD_DB_DIALECT || process.env.DEV_DB_DIALECT
        },
        error: dbError
      },
      routes: {
        available: [
          "/api/users (POST - signup)",
          "/api/users/login (POST - signin)",
          "/api/user (GET, PUT)",
          "/api/articles (GET, POST)",
          "/api/profiles/:username (GET)",
          "/api/tags (GET)",
          "/api/health (GET)",
          "/api/debug/status (GET)"
        ]
      }
    };
    
    console.log("[DEBUG] Status response:", JSON.stringify(status, null, 2));
    res.json(status);
  } catch (error) {
    console.error("[DEBUG] ✗ Status check failed:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      stack: error.stack 
    });
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
