const axios = require("axios");
const { spawn } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const demoOutputs = require("../data/demoOutputs");
const { STARTER_TEMPLATES } = require("../data/starterTemplates");

// Language to Judge0 ID mapping
const LANGUAGE_IDS = {
  javascript: 63, typescript: 74, python: 71, java: 62, cpp: 54, c: 50,
  csharp: 51, go: 60, rust: 73, swift: 83, kotlin: 78, scala: 81,
  ruby: 72, php: 68, lua: 64, perl: 85, bash: 46, r: 80,
  haskell: 61, ocaml: 65, elixir: 57, erlang: 58, sql: 82, assembly: 45,
};

// Compiler/Interpreter commands
const COMPILERS = {
  javascript: "node",
  python: "python3", // will try python if python3 fails
  java: "javac",
  cpp: "g++",
  c: "gcc",
  go: "go",
  bash: "bash",
  ruby: "ruby",
  php: "php",
  rust: "rustc",
};

// Track which compilers are available (cached)
let compilerCache = null;

/**
 * Check if a compiler/interpreter is available on this system
 */
const checkCompilerAvailable = async (language) => {
  const cmd = COMPILERS[language];
  if (!cmd) return false;

  return new Promise((resolve) => {
    const proc = spawn(cmd, ["--version"], {
      timeout: 3000,
      stdio: "pipe",
    });
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
    setTimeout(() => {
      try {
        proc.kill();
      } catch (e) {}
      resolve(false);
    }, 3000);
  });
};

/**
 * Get all available compilers (cached)
 */
const getAvailableCompilers = async () => {
  if (compilerCache) return compilerCache;

  const available = {};
  for (const [lang] of Object.entries(COMPILERS)) {
    available[lang] = await checkCompilerAvailable(lang);
  }
  compilerCache = available;
  return available;
};

/**
 * LAYER 1: Judge0 (requires internet)
 */
const executeViaJudge0 = async (code, language, stdin) => {
  try {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return null; // Unsupported language, fall through
    }

    const client = axios.create({
      baseURL: process.env.JUDGE0_API_URL || "https://ce.judge0.com",
      timeout: 15000,
    });

    // Only add RapidAPI headers if key is configured and not a placeholder
    const headers = { "content-type": "application/json" };
    if (
      process.env.JUDGE0_API_KEY &&
      process.env.JUDGE0_API_KEY !== "your_rapidapi_key_here" &&
      process.env.JUDGE0_API_KEY.trim()
    ) {
      headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
      headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    }

    const codeBase64 = Buffer.from(code).toString("base64");
    const stdinBase64 = Buffer.from(stdin || "").toString("base64");

    const response = await client.post(
      "/submissions?base64_encoded=true&wait=true",
      {
        source_code: codeBase64,
        language_id: languageId,
        stdin: stdinBase64,
      },
      { headers }
    );

    const data = response.data;

    return {
      stdout: data.stdout ? Buffer.from(data.stdout, "base64").toString() : "",
      stderr: data.stderr ? Buffer.from(data.stderr, "base64").toString() : "",
      compileOutput: data.compile_output ? Buffer.from(data.compile_output, "base64").toString() : "",
      status: mapJudge0Status(data.status?.id),
      time: data.time || 0,
      memory: data.memory || 0,
      engine: "judge0",
    };
  } catch (error) {
    console.log(`Judge0 layer failed for ${language}:`, error.message);
    if (error.response?.status === 429 || error.response?.status >= 500) {
      console.log("Judge0 rate limited or down, falling to next layer");
    }
    return null; // Fall through to next layer
  }
};

/**
 * Map Judge0 status ID to human-readable status
 */
const mapJudge0Status = (statusId) => {
  const statusMap = {
    1: "In Queue",
    2: "Processing",
    3: "Accepted",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error",
  };
  return statusMap[statusId] || "Unknown";
};

/**
 * LAYER 2: Local Runner (safe only in development)
 * WARNING: Running untrusted code locally is a security risk on production servers.
 * This layer is disabled on production (NODE_ENV=production).
 */
const executeLocally = async (code, language, stdin) => {
  // Security: Disable on production
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LOCAL_RUNNER !== "true") {
    console.log("Local runner disabled on production");
    return null;
  }

  try {
    // Create temp directory for this execution
    const tempDir = path.join(os.tmpdir(), `codeshare-${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    let result;
    const startTime = process.hrtime.bigint();

    try {
      switch (language) {
        case "javascript":
          result = await runJavaScript(code, stdin, tempDir);
          break;
        case "python":
          result = await runPython(code, stdin, tempDir);
          break;
        case "java":
          result = await runJava(code, stdin, tempDir);
          break;
        case "cpp":
          result = await runCpp(code, stdin, tempDir);
          break;
        case "c":
          result = await runC(code, stdin, tempDir);
          break;
        case "bash":
          result = await runBash(code, stdin, tempDir);
          break;
        case "ruby":
          result = await runRuby(code, stdin, tempDir);
          break;
        case "php":
          result = await runPhp(code, stdin, tempDir);
          break;
        case "go":
          result = await runGo(code, stdin, tempDir);
          break;
        case "rust":
          result = await runRust(code, stdin, tempDir);
          break;
        default:
          return null; // Unsupported language
      }

      const endTime = process.hrtime.bigint();
      const elapsedMs = Number(endTime - startTime) / 1_000_000;

      result.time = (elapsedMs / 1000).toFixed(2);
      result.engine = "local";
      return result;
    } finally {
      // Always clean up temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.error("Failed to clean temp directory:", e.message);
      }
    }
  } catch (error) {
    console.log(`Local runner failed for ${language}:`, error.message);
    return null; // Fall through to demo mode
  }
};

/**
 * Helper: Execute a child process with timeout and output limits
 */
const executeProcess = (proc, stdin, timeoutMs = 10000, outputLimitBytes = 100 * 1024) => {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill("SIGKILL");
      } catch (e) {}
    }, timeoutMs);

    proc.stdout?.on("data", (data) => {
      if (stdout.length + data.length <= outputLimitBytes) {
        stdout += data.toString();
      }
    });

    proc.stderr?.on("data", (data) => {
      if (stderr.length + data.length <= outputLimitBytes) {
        stderr += data.toString();
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (timedOut) {
        resolve({
          stdout,
          stderr,
          compileOutput: "",
          status: "Time Limit Exceeded",
          memory: 0,
        });
      } else if (code === 0) {
        resolve({
          stdout,
          stderr,
          compileOutput: "",
          status: "Accepted",
          memory: 0,
        });
      } else {
        resolve({
          stdout,
          stderr,
          compileOutput: stderr || `Process exited with code ${code}`,
          status: "Runtime Error",
          memory: 0,
        });
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        stdout,
        stderr: err.message,
        compileOutput: err.message,
        status: "Runtime Error",
        memory: 0,
      });
    });

    if (stdin) {
      proc.stdin?.write(stdin);
    }
    proc.stdin?.end();
  });
};

/**
 * Language runners
 */
const runJavaScript = async (code, stdin, tempDir) => {
  const proc = spawn("node", [], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });
  return executeProcess(proc, stdin);
};

const runPython = async (code, stdin, tempDir) => {
  // Try python3 first, then python
  let cmd = "python3";
  try {
    await checkCompilerAvailable("python");
    cmd = "python";
  } catch (e) {}

  const filePath = path.join(tempDir, "main.py");
  fs.writeFileSync(filePath, code);

  const proc = spawn(cmd, [filePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(proc, stdin);
};

const runJava = async (code, stdin, tempDir) => {
  const filePath = path.join(tempDir, "Main.java");
  fs.writeFileSync(filePath, code);

  // Compile
  const compileProc = spawn("javac", [filePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  const compileResult = await executeProcess(compileProc, "");
  if (compileResult.status !== "Accepted") {
    return {
      stdout: "",
      stderr: compileResult.stderr || compileResult.compileOutput,
      compileOutput: compileResult.compileOutput || compileResult.stderr,
      status: "Compilation Error",
      memory: 0,
    };
  }

  // Run
  const runProc = spawn("java", ["-cp", tempDir, "Main"], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(runProc, stdin);
};

const runCpp = async (code, stdin, tempDir) => {
  const srcPath = path.join(tempDir, "main.cpp");
  const exePath = path.join(tempDir, "main");
  fs.writeFileSync(srcPath, code);

  // Compile
  const compileProc = spawn("g++", [srcPath, "-o", exePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  const compileResult = await executeProcess(compileProc, "");
  if (compileResult.status !== "Accepted") {
    return {
      stdout: "",
      stderr: compileResult.stderr || compileResult.compileOutput,
      compileOutput: compileResult.compileOutput || compileResult.stderr,
      status: "Compilation Error",
      memory: 0,
    };
  }

  // Run
  const runProc = spawn(exePath, [], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(runProc, stdin);
};

const runC = async (code, stdin, tempDir) => {
  const srcPath = path.join(tempDir, "main.c");
  const exePath = path.join(tempDir, "main");
  fs.writeFileSync(srcPath, code);

  // Compile
  const compileProc = spawn("gcc", [srcPath, "-o", exePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  const compileResult = await executeProcess(compileProc, "");
  if (compileResult.status !== "Accepted") {
    return {
      stdout: "",
      stderr: compileResult.stderr || compileResult.compileOutput,
      compileOutput: compileResult.compileOutput || compileResult.stderr,
      status: "Compilation Error",
      memory: 0,
    };
  }

  // Run
  const runProc = spawn(exePath, [], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(runProc, stdin);
};

const runBash = async (code, stdin, tempDir) => {
  const proc = spawn("bash", [], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(proc, stdin + (stdin ? "\n" : "") + code);
};

const runRuby = async (code, stdin, tempDir) => {
  const filePath = path.join(tempDir, "main.rb");
  fs.writeFileSync(filePath, code);

  const proc = spawn("ruby", [filePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(proc, stdin);
};

const runPhp = async (code, stdin, tempDir) => {
  const filePath = path.join(tempDir, "main.php");
  fs.writeFileSync(filePath, code);

  const proc = spawn("php", [filePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(proc, stdin);
};

const runGo = async (code, stdin, tempDir) => {
  const filePath = path.join(tempDir, "main.go");
  fs.writeFileSync(filePath, code);

  const proc = spawn("go", ["run", filePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(proc, stdin);
};

const runRust = async (code, stdin, tempDir) => {
  const srcPath = path.join(tempDir, "main.rs");
  const exePath = path.join(tempDir, "main");
  fs.writeFileSync(srcPath, code);

  // Compile
  const compileProc = spawn("rustc", [srcPath, "-o", exePath], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  const compileResult = await executeProcess(compileProc, "");
  if (compileResult.status !== "Accepted") {
    return {
      stdout: "",
      stderr: compileResult.stderr || compileResult.compileOutput,
      compileOutput: compileResult.compileOutput || compileResult.stderr,
      status: "Compilation Error",
      memory: 0,
    };
  }

  // Run
  const runProc = spawn(exePath, [], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  });

  return executeProcess(runProc, stdin);
};

/**
 * LAYER 3: Demo Mode (fallback for review)
 * Returns pre-defined output only for starter templates
 */
const executeDemoMode = (code, language, stdin) => {
  const template = STARTER_TEMPLATES[language]?.trim() || "";
  const userCode = code.trim();

  // Check if code matches the template exactly
  if (userCode === template) {
    // Return pre-defined output for this template + stdin
    const key = stdin ? `${language}-stdin` : language;
    const output = demoOutputs[key] || demoOutputs[language];

    if (output) {
      return {
        stdout: output,
        stderr: "",
        compileOutput: "",
        status: "Accepted",
        time: 0.001,
        memory: 0,
        engine: "demo",
      };
    }
  }

  // Code doesn't match template, can't execute
  return {
    stdout: "",
    stderr: "",
    compileOutput: "",
    status: "Execution Unavailable",
    time: 0,
    memory: 0,
    engine: "demo",
  };
};

/**
 * Main execution function: tries layers in order
 */
const executeCode = async (code, language, stdin = "") => {
  if (!code || !language) {
    return {
      stdout: "",
      stderr: "Code and language are required",
      compileOutput: "",
      status: "Error",
      time: 0,
      memory: 0,
      engine: "none",
    };
  }

  // LAYER 1: Judge0
  console.log(`Attempting execution via Judge0 for ${language}`);
  let result = await executeViaJudge0(code, language, stdin);
  if (result) return result;

  // LAYER 2: Local Runner (if enabled and compiler available)
  const shouldTryLocal = process.env.ENABLE_LOCAL_RUNNER !== "false";
  if (shouldTryLocal) {
    console.log(`Attempting execution via local runner for ${language}`);
    result = await executeLocally(code, language, stdin);
    if (result) return result;
  }

  // LAYER 3: Demo Mode
  console.log(`Attempting demo mode for ${language}`);
  result = executeDemoMode(code, language, stdin);

  // If demo mode can't execute, return unavailable message
  if (result.status === "Execution Unavailable") {
    return {
      stdout: "",
      stderr: "",
      compileOutput: "",
      status: "Execution Unavailable",
      time: 0,
      memory: 0,
      engine: "none",
      message: "No execution engine is reachable. Set JUDGE0_API_URL or install the language locally.",
    };
  }

  return result;
};

module.exports = {
  executeCode,
  getAvailableCompilers,
  LANGUAGE_IDS,
};
