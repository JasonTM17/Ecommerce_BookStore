#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const standaloneRoot = join(projectRoot, ".next", "standalone");
const standaloneServer = join(standaloneRoot, "server.js");

function parseArgs(argv) {
  const options = {
    port: process.env.PORT || "3000",
    hostname: process.env.HOSTNAME || "0.0.0.0",
    rebuild: false,
    killPort: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-p" || arg === "--port") {
      options.port = argv[index + 1] || options.port;
      index += 1;
    } else if (arg.startsWith("--port=")) {
      options.port = arg.slice("--port=".length);
    } else if (arg === "--hostname" || arg === "-H") {
      options.hostname = argv[index + 1] || options.hostname;
      index += 1;
    } else if (arg.startsWith("--hostname=")) {
      options.hostname = arg.slice("--hostname=".length);
    } else if (arg === "--rebuild") {
      options.rebuild = true;
    } else if (arg === "--kill-port") {
      options.killPort = true;
    }
  }

  return options;
}

function runChecked(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    shell: false,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    const detail = result.error
      ? result.error.message
      : result.signal
        ? `signal ${result.signal}`
        : `status ${result.status}`;
    throw new Error(`${command} ${args.join(" ")} failed with ${detail}`);
  }
}

function runNpmScript(scriptName) {
  if (process.platform === "win32") {
    runChecked("cmd.exe", ["/d", "/s", "/c", "npm", "run", scriptName]);
    return;
  }

  runChecked("npm", ["run", scriptName]);
}

function ensureBuild(rebuild) {
  if (!rebuild && existsSync(standaloneServer)) {
    return;
  }

  console.log("[start-standalone] building Next.js standalone output...");
  runNpmScript("build");
}

function copyDirectory(source, destination, label, required = true) {
  if (!existsSync(source)) {
    if (required) {
      throw new Error(`${label} is missing at ${source}`);
    }
    return;
  }

  mkdirSync(dirname(destination), { recursive: true });
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
  console.log(`[start-standalone] prepared ${label}`);
}

function prepareStandaloneAssets() {
  copyDirectory(
    join(projectRoot, ".next", "static"),
    join(standaloneRoot, ".next", "static"),
    ".next/static",
  );
  copyDirectory(
    join(projectRoot, "public"),
    join(standaloneRoot, "public"),
    "public assets",
    false,
  );
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout || "";
}

function getListeningPids(port) {
  if (process.platform === "win32") {
    const output = commandOutput("powershell.exe", [
      "-NoProfile",
      "-Command",
      `(Get-NetTCPConnection -LocalPort ${Number(port)} -State Listen -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique`,
    ]);
    return output
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
  }

  const lsofOutput = commandOutput("lsof", [
    "-ti",
    `tcp:${port}`,
    "-sTCP:LISTEN",
  ]);
  return lsofOutput
    .split(/\s+/)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function freePort(port) {
  const currentPid = process.pid;
  const pids = getListeningPids(port).filter((pid) => pid !== currentPid);

  if (pids.length === 0) {
    return;
  }

  console.log(
    `[start-standalone] stopping process(es) on port ${port}: ${pids.join(", ")}`,
  );

  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // The process may have exited between discovery and termination.
    }
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const remaining = getListeningPids(port).filter((pid) => pid !== currentPid);
    if (remaining.length === 0) {
      return;
    }
    await sleep(250);
  }

  const remaining = getListeningPids(port).filter((pid) => pid !== currentPid);
  if (remaining.length > 0) {
    throw new Error(
      `Port ${port} is still in use by process(es): ${remaining.join(", ")}`,
    );
  }
}

function startStandaloneServer({ port, hostname }) {
  console.log(
    `[start-standalone] starting standalone server on http://${hostname}:${port}`,
  );

  const child = spawn(process.execPath, ["server.js"], {
    cwd: standaloneRoot,
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: hostname,
    },
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

const options = parseArgs(process.argv.slice(2));

if (options.killPort) {
  await freePort(options.port);
}

ensureBuild(options.rebuild);
prepareStandaloneAssets();
startStandaloneServer(options);
