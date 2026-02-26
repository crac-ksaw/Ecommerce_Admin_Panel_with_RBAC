#!/usr/bin/env node
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const backendEnvPath = path.join(rootDir, "backend", ".env");
const frontendEnvPath = path.join(rootDir, "frontend", ".env");
const backendEnvExamplePath = path.join(rootDir, "backend", ".env.example");
const frontendEnvExamplePath = path.join(rootDir, "frontend", ".env.example");

const createdFiles = [];
let failedStep = "";
let failedOutput = "";

function printStep(message) {
  console.log(`\n[setup] ${message}`);
}

function runCommand(stepName, command, args, options = {}) {
  printStep(stepName);
  const fullCommand = [command, ...args].join(" ");
  const result = spawnSync(fullCommand, {
    cwd: options.cwd || rootDir,
    encoding: "utf-8",
    stdio: "pipe",
    shell: true,
  });

  if (result.error) {
    failedStep = stepName;
    failedOutput = result.error.message;
    throw new Error(`${stepName} failed`);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.status !== 0) {
    failedStep = stepName;
    failedOutput = (result.stderr || result.stdout || "").trim();
    throw new Error(`${stepName} failed`);
  }
}

function ensureFileFromExample(targetPath, examplePath, label) {
  if (fs.existsSync(targetPath)) {
    printStep(`${label} already exists, skipping`);
    return;
  }

  if (!fs.existsSync(examplePath)) {
    failedStep = `Create ${label}`;
    failedOutput = `Missing example file: ${examplePath}`;
    throw new Error(`Missing ${label} example file`);
  }

  fs.copyFileSync(examplePath, targetPath);
  createdFiles.push(targetPath);
  printStep(`${label} created from example`);
}

function cleanupOnFailure() {
  if (createdFiles.length === 0) {
    return;
  }

  printStep("Running cleanup for created files");
  createdFiles.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[cleanup] Removed ${path.relative(rootDir, filePath)}`);
      }
    } catch (error) {
      console.error(
        `[cleanup] Could not remove ${path.relative(rootDir, filePath)}: ${error.message}`
      );
    }
  });
}

function printFailureAndExit() {
  console.error("\n[setup] Setup failed.");
  console.error(`[setup] Step: ${failedStep || "Unknown step"}`);
  if (failedOutput) {
    console.error(`[setup] Details:\n${failedOutput}`);
  }
  console.error(
    "[setup] Rollback note: only files created by this setup run were removed automatically."
  );
  console.error(
    "[setup] If migration/seed partially changed the database, reset it manually if needed."
  );
  process.exit(1);
}

try {
  runCommand("Install root dependencies", "npm", ["install"]);
  runCommand("Install backend dependencies", "npm", ["install"], {
    cwd: path.join(rootDir, "backend"),
  });
  runCommand("Install frontend dependencies", "npm", ["install"], {
    cwd: path.join(rootDir, "frontend"),
  });

  ensureFileFromExample(backendEnvPath, backendEnvExamplePath, "backend/.env");
  ensureFileFromExample(frontendEnvPath, frontendEnvExamplePath, "frontend/.env");

  runCommand("Run backend migrations", "npx", ["prisma", "migrate", "deploy"], {
    cwd: path.join(rootDir, "backend"),
  });
  runCommand("Run backend seed", "npm", ["run", "prisma:seed"], {
    cwd: path.join(rootDir, "backend"),
  });

  console.log("\n[setup] Setup completed successfully.");
  console.log("[setup] Next step: run `npm run dev` from the project root.");
} catch (_error) {
  cleanupOnFailure();
  printFailureAndExit();
}
