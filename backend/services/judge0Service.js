const axios = require("axios");

const LANGUAGE_IDS = {
  javascript: 63, typescript: 74, python: 71, java: 62, cpp: 54, c: 50,
  csharp: 51, go: 60, rust: 73, swift: 83, kotlin: 78, scala: 81,
  ruby: 72, php: 68, lua: 64, perl: 85, bash: 46, r: 80,
  haskell: 61, ocaml: 65, elixir: 57, erlang: 58, sql: 82, assembly: 45,
};

// Starter templates for each language
const STARTER_TEMPLATES = {
  javascript: 'console.log("Hello, World!");',
  typescript: 'console.log("Hello, World!");',
  python: 'print("Hello, World!")',
  java: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
  cpp: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }',
  c: '#include <stdio.h>\nint main() { printf("Hello, World!\\n"); return 0; }',
  csharp: 'using System; class Program { static void Main() { Console.WriteLine("Hello, World!"); } }',
  go: 'package main\nimport "fmt"\nfunc main() { fmt.Println("Hello, World!") }',
  rust: 'fn main() { println!("Hello, World!"); }',
  swift: 'print("Hello, World!")',
  kotlin: 'fun main() { println("Hello, World!") }',
  scala: 'object Main { def main(args: Array[String]) { println("Hello, World!") } }',
  ruby: 'puts "Hello, World!"',
  php: '<?php echo "Hello, World!"; ?>',
  lua: 'print("Hello, World!")',
  perl: 'print "Hello, World!\\n";',
  bash: 'echo "Hello, World!"',
  r: 'print("Hello, World!")',
  haskell: 'main = putStrLn "Hello, World!"',
  ocaml: 'let () = print_endline "Hello, World!"',
  elixir: 'IO.puts("Hello, World!")',
  erlang: '-module(main). -export([start/0]). start() -> io:fwrite("Hello, World!\\n").',
  sql: 'SELECT "Hello, World!" as message;',
  assembly: 'mov eax, 1\nmov ebx, 0\nint 0x80',
};

const createJudge0Client = () => {
  const headers = {
    "content-type": "application/json",
  };

  // Only add RapidAPI headers if API key is configured
  if (process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_HOST) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST;
  }

  return axios.create({
    baseURL: process.env.JUDGE0_API_URL || "https://ce.judge0.com",
    headers,
    timeout: 30000,
  });
};

const executeCode = async (code, language, input = "") => {
  try {
    const language_id = LANGUAGE_IDS[language];
    if (!language_id) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const judge0 = createJudge0Client();

    // Base64 encode for safety
    const codeBase64 = Buffer.from(code).toString("base64");
    const inputBase64 = Buffer.from(input).toString("base64");

    const { data } = await judge0.post("/submissions?base64_encoded=true&wait=true", {
      source_code: codeBase64,
      language_id,
      stdin: inputBase64,
    });

    // Decode results
    const stdout = data.stdout ? Buffer.from(data.stdout, "base64").toString() : "";
    const stderr = data.stderr ? Buffer.from(data.stderr, "base64").toString() : "";
    const compileOutput = data.compile_output ? Buffer.from(data.compile_output, "base64").toString() : "";

    return {
      stdout,
      stderr,
      compileOutput,
      status: data.status?.description || "Unknown",
      time: data.time || 0,
      memory: data.memory || 0,
    };
  } catch (error) {
    console.error("Judge0 execution error:", error.message);
    
    // Return clear error message
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return {
        stdout: "",
        stderr: "Execution service unreachable. Check JUDGE0_API_URL.",
        compileOutput: "",
        status: "Error",
        time: 0,
        memory: 0,
      };
    }

    return {
      stdout: "",
      stderr: error.response?.data?.message || error.message || "Unknown execution error",
      compileOutput: "",
      status: "Error",
      time: 0,
      memory: 0,
    };
  }
};

module.exports = { executeCode, LANGUAGE_IDS, STARTER_TEMPLATES };