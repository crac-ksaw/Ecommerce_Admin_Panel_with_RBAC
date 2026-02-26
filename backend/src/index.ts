import dotenv from "dotenv";
import net from "net";
import path from "path";
import { Server } from "http";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require("./app").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = require("./utils/prisma").default;

const DB_MAX_RETRIES = 5;
const DB_RETRY_DELAY_MS = 2000;

type StartupConfig = {
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  port: number;
};

class FatalStartupError extends Error {}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateStartupConfig(): StartupConfig {
  const missing: string[] = [];

  const nodeEnv = process.env.NODE_ENV || "development";
  const databaseUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const rawPort = process.env.PORT || "4000";
  const parsedPort = Number(rawPort);

  if (!databaseUrl) {
    missing.push("DATABASE_URL");
  }

  if (!jwtSecret) {
    missing.push("JWT_SECRET");
  }

  if (!rawPort || Number.isNaN(parsedPort) || parsedPort <= 0) {
    missing.push("PORT (must be a valid positive number)");
  }

  if (missing.length > 0) {
    throw new FatalStartupError(
      `Missing/invalid environment configuration:\n- ${missing.join("\n- ")}`
    );
  }

  return {
    nodeEnv,
    databaseUrl: databaseUrl as string,
    jwtSecret: jwtSecret as string,
    port: parsedPort,
  };
}

async function ensurePortAvailable(port: number) {
  await new Promise<void>((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new FatalStartupError(
            `Port ${port} is already in use. Stop the conflicting process or set a different PORT.`
          )
        );
        return;
      }
      reject(error);
    });

    tester.once("listening", () => {
      tester.close(() => resolve());
    });

    tester.listen(port, "0.0.0.0");
  });
}

async function connectDatabaseWithRetry() {
  for (let attempt = 1; attempt <= DB_MAX_RETRIES; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      if (attempt === DB_MAX_RETRIES) {
        throw new FatalStartupError(
          `Database connection failed after ${DB_MAX_RETRIES} attempts. Last error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      console.warn(
        `[startup] Database unavailable (attempt ${attempt}/${DB_MAX_RETRIES}). Retrying in ${
          DB_RETRY_DELAY_MS / 1000
        }s...`
      );
      await wait(DB_RETRY_DELAY_MS);
    }
  }
}

function printStartupBanner(config: StartupConfig) {
  console.log("========================================");
  console.log(" E-commerce Admin API Startup");
  console.log("========================================");
  console.log(` Mode: ${config.nodeEnv}`);
  console.log(` Database: connected`);
  console.log(` JWT Secret: loaded (${config.jwtSecret.length} chars)`);
  console.log(` Port: ${config.port}`);
  console.log("========================================");
}

let server: Server | null = null;

async function shutdown(exitCode = 0) {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("[shutdown] Failed to disconnect Prisma:", error);
  }

  if (server) {
    server.close(() => {
      process.exit(exitCode);
    });
    return;
  }

  process.exit(exitCode);
}

process.on("unhandledRejection", (reason) => {
  console.error("[fatal] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[fatal] Uncaught Exception:", error);
  void shutdown(1);
});

process.on("SIGINT", () => {
  void shutdown(0);
});

process.on("SIGTERM", () => {
  void shutdown(0);
});

async function bootstrap() {
  const config = validateStartupConfig();
  await ensurePortAvailable(config.port);
  await connectDatabaseWithRetry();

  printStartupBanner(config);

  const startedServer = app.listen(config.port, () => {
    console.log(`[startup] API server listening on port ${config.port}`);
  });

  server = startedServer;

  startedServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `[startup] Port ${config.port} is already in use. Set a different PORT in your environment.`
      );
      void shutdown(1);
      return;
    }
    console.error("[startup] Server failed to start:", error);
    void shutdown(1);
  });
}

bootstrap().catch((error) => {
  console.error(
    `[startup] ${error instanceof Error ? error.message : "Unknown startup error"}`
  );
  process.exit(1);
});
