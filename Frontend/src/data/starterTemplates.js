/**
 * Starter code templates for all 24 languages
 * Shown when user first selects a language or code editor is empty
 */

export const STARTER_TEMPLATES = {
  javascript: 'console.log("Hello, World!");',
  typescript: 'console.log("Hello, World!");',
  python: 'print("Hello, World!")',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
  cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}',
  c: '#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}',
  csharp: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}',
  go: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}',
  rust: 'fn main() {\n  println!("Hello, World!");\n}',
  swift: 'print("Hello, World!")',
  kotlin: 'fun main() {\n  println("Hello, World!")\n}',
  scala: 'object Main {\n  def main(args: Array[String]) {\n    println("Hello, World!")\n  }\n}',
  ruby: 'puts "Hello, World!"',
  php: '<?php\necho "Hello, World!";\n?>',
  lua: 'print("Hello, World!")',
  perl: 'print "Hello, World!\\n";',
  bash: 'echo "Hello, World!"',
  r: 'print("Hello, World!")',
  haskell: 'main = putStrLn "Hello, World!"',
  ocaml: 'let () = print_endline "Hello, World!"',
  elixir: 'IO.puts("Hello, World!")',
  erlang: '-module(main).\n-export([start/0]).\nstart() -> io:fwrite("Hello, World!\\n").',
  sql: 'SELECT "Hello, World!" as message;',
  assembly: 'mov eax, 1\nmov ebx, 0\nint 0x80',
};

/**
 * Get starter template for a language
 */
export const getStarterTemplate = (language) => {
  return STARTER_TEMPLATES[language] || '// Code goes here';
};

/**
 * Check if code is empty or still the template for the language
 */
export const isEmptyOrTemplate = (code, language) => {
  if (!code || code.trim() === '') return true;
  const template = STARTER_TEMPLATES[language] || '';
  return code.trim() === template.trim();
};
