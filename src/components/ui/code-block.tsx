"use client";

import { memo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Language mapping for display names
const languageMap: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  py: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  cpp: "C++",
  c: "C",
  java: "Java",
  kt: "Kotlin",
  swift: "Swift",
  php: "PHP",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  dockerfile: "Dockerfile",
  docker: "Docker",
  gitignore: "Git",
  env: "Environment",
  toml: "TOML",
  ini: "INI",
  xml: "XML",
  svg: "SVG",
  graphql: "GraphQL",
  gql: "GraphQL",
};

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

export const CodeBlock = memo(function CodeBlock({
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const displayLanguage = languageMap[language] || language;

  // Don't show certain language labels
  const shouldShowLanguage =
    language && !["latex", "markdown", "text"].includes(language.toLowerCase());

  const handleCopy = async () => {
    const code = String(children).replace(/\n$/, "");
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = resolvedTheme === 'dark';

  // Inline code styling - adapts to theme
  if (inline) {
    return (
      <code
        className={cn(
          "relative rounded px-1.5 py-0.5 font-mono text-sm break-words border overflow-wrap-break-word",
          isDark
            ? "bg-neutral-800/60 text-neutral-200 border-neutral-700/30"
            : "bg-neutral-200/80 text-neutral-900 border-neutral-300/50",
          className
        )}
        style={{
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
          maxWidth: '100%',
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  // Custom dark theme to avoid selection-like appearance
  const customDarkStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'rgb(15 15 15)', // Much darker background
      color: '#e5e7eb',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      color: '#e5e7eb',
    },
  };

  // Block code with header and syntax highlighting
  return (
    <div className="relative group my-6 w-full">
      {/* Header with language and copy button */}
      <div className={cn(
        "flex items-center justify-between border rounded-t-lg px-4 py-2",
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-neutral-100 border-neutral-300"
      )}>
        <div className="flex items-center gap-2">
          {shouldShowLanguage && (
            <span className={cn(
              "text-xs font-medium",
              isDark ? "text-neutral-400" : "text-neutral-600"
            )}>
              {displayLanguage}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors rounded",
            isDark
              ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200"
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="relative overflow-hidden rounded-b-lg">
        <SyntaxHighlighter
          language={language || "text"}
          style={isDark ? customDarkStyle : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            border: isDark 
              ? "1px solid rgb(38 38 38)" 
              : "1px solid rgb(212 212 212)",
            borderTop: "none",
            background: isDark 
              ? "rgb(15 15 15)" 
              : "rgb(249 250 251)",
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            overflowX: 'auto',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            maxWidth: '100%',
            minWidth: '0',
            width: '100%',
            boxSizing: 'border-box',
          }}
          wrapLongLines={true}
          showLineNumbers={false}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});