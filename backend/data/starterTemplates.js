/**
 * Starter templates for all 24 languages
 * These are shown when the user first selects a language
 */

const STARTER_TEMPLATES = {
  // Basic templates
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

/**
 * Richer samples with stdin/loops for some languages
 * Used in the template picker or for demo purposes
 */
const RICHER_SAMPLES = {
  javascript: {
    basic: 'console.log("Hello, World!");',
    loop: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}',
    stdin: 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.question("Enter your name: ", (name) => {\n  console.log(`Hello, ${name}!`);\n  rl.close();\n});',
  },
  python: {
    basic: 'print("Hello, World!")',
    loop: 'for i in range(1, 6):\n  print(i)',
    stdin: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
  },
  java: {
    basic: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
    loop: 'public class Main { public static void main(String[] args) { for (int i = 1; i <= 5; i++) { System.out.println(i); } } }',
    stdin: 'import java.util.Scanner; public class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); String name = sc.nextLine(); System.out.println("Hello, " + name + "!"); } }',
  },
  cpp: {
    basic: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }',
    loop: '#include <iostream>\nint main() { for (int i = 1; i <= 5; i++) { std::cout << i << std::endl; } return 0; }',
    stdin: '#include <iostream>\n#include <string>\nint main() { std::string name; std::cout << "Enter your name: "; std::getline(std::cin, name); std::cout << "Hello, " << name << "!" << std::endl; return 0; }',
  },
};

module.exports = { STARTER_TEMPLATES, RICHER_SAMPLES };
