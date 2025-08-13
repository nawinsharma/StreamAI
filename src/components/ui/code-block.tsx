"use client";

import { memo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

// Custom theme without selection highlighting
const customTheme = {
  ...dracula,
  'pre[class*="language-"]': {
    ...dracula['pre[class*="language-"]'],
    background: 'transparent',
  },
  'code[class*="language-"]': {
    ...dracula['code[class*="language-"]'],
    background: 'transparent',
  },
  '.token': {
    ...dracula['.token'],
    background: 'transparent !important',
  },
  '.token.comment': {
    ...dracula['.token.comment'],
    background: 'transparent !important',
  },
  '.token.prolog': {
    ...dracula['.token.prolog'],
    background: 'transparent !important',
  },
  '.token.doctype': {
    ...dracula['.token.doctype'],
    background: 'transparent !important',
  },
  '.token.cdata': {
    ...dracula['.token.cdata'],
    background: 'transparent !important',
  },
  '.token.punctuation': {
    ...dracula['.token.punctuation'],
    background: 'transparent !important',
  },
  '.token.namespace': {
    ...dracula['.token.namespace'],
    background: 'transparent !important',
  },
  '.token.property': {
    ...dracula['.token.property'],
    background: 'transparent !important',
  },
  '.token.tag': {
    ...dracula['.token.tag'],
    background: 'transparent !important',
  },
  '.token.boolean': {
    ...dracula['.token.boolean'],
    background: 'transparent !important',
  },
  '.token.number': {
    ...dracula['.token.number'],
    background: 'transparent !important',
  },
  '.token.constant': {
    ...dracula['.token.constant'],
    background: 'transparent !important',
  },
  '.token.symbol': {
    ...dracula['.token.symbol'],
    background: 'transparent !important',
  },
  '.token.deleted': {
    ...dracula['.token.deleted'],
    background: 'transparent !important',
  },
  '.token.selector': {
    ...dracula['.token.selector'],
    background: 'transparent !important',
  },
  '.token.attr-name': {
    ...dracula['.token.attr-name'],
    background: 'transparent !important',
  },
  '.token.string': {
    ...dracula['.token.string'],
    background: 'transparent !important',
  },
  '.token.char': {
    ...dracula['.token.char'],
    background: 'transparent !important',
  },
  '.token.builtin': {
    ...dracula['.token.builtin'],
    background: 'transparent !important',
  },
  '.token.inserted': {
    ...dracula['.token.inserted'],
    background: 'transparent !important',
  },
  '.token.operator': {
    ...dracula['.token.operator'],
    background: 'transparent !important',
  },
  '.token.entity': {
    ...dracula['.token.entity'],
    background: 'transparent !important',
  },
  '.token.url': {
    ...dracula['.token.url'],
    background: 'transparent !important',
  },
  '.language-css .token.string': {
    ...dracula['.language-css .token.string'],
    background: 'transparent !important',
  },
  '.style .token.string': {
    ...dracula['.style .token.string'],
    background: 'transparent !important',
  },
  '.token.variable': {
    ...dracula['.token.variable'],
    background: 'transparent !important',
  },
  '.token.atrule': {
    ...dracula['.token.atrule'],
    background: 'transparent !important',
  },
  '.token.attr-value': {
    ...dracula['.token.attr-value'],
    background: 'transparent !important',
  },
  '.token.function': {
    ...dracula['.token.function'],
    background: 'transparent !important',
  },
  '.token.class-name': {
    ...dracula['.token.class-name'],
    background: 'transparent !important',
  },
  '.token.regex': {
    ...dracula['.token.regex'],
    background: 'transparent !important',
  },
  '.token.important': {
    ...dracula['.token.important'],
    background: 'transparent !important',
  },
  '.token.keyword': {
    ...dracula['.token.keyword'],
    background: 'transparent !important',
  },
  '.token.bold': {
    ...dracula['.token.bold'],
    background: 'transparent !important',
  },
  '.token.italic': {
    ...dracula['.token.italic'],
    background: 'transparent !important',
  },
};

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

// Language mapping for better display names
const languageMap: Record<string, string> = {
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
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

export const CodeBlock = memo(function CodeBlock({
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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

  if (inline) {
    return (
      <code
        className={cn(
          "relative rounded bg-neutral-800/80 px-1.5 py-0.5 font-mono text-sm text-white break-words border border-neutral-700/50",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-6 w-full">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-neutral-800 to-neutral-900 px-4 py-3 text-sm border border-neutral-700/50 border-b-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {shouldShowLanguage && (
            <>
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-neutral-300 font-medium ml-2 truncate">
                {displayLanguage}
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-700/50 hover:text-white transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50 flex-shrink-0 ml-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <div className="relative overflow-hidden rounded-b-lg border border-neutral-700/50 bg-neutral-900/90 backdrop-blur-sm">
        <div className="overflow-x-auto w-full">
          {language && shouldShowLanguage ? (
            <SyntaxHighlighter
              language={language}
              style={customTheme}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                background: "transparent",
                borderRadius: "0 0 0.5rem 0.5rem",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                width: "100%",
                maxWidth: "100%",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
              showLineNumbers={true}
              wrapLines={true}
              wrapLongLines={true}
              lineNumberStyle={{
                color: "#6b7280",
                fontSize: "0.75rem",
                minWidth: "2.5rem",
                paddingRight: "1rem",
                userSelect: "none",
              }}
              lineProps={{
                style: {
                  background: "transparent",
                  padding: "0",
                  margin: "0",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                }
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <pre className="rounded-b-lg bg-neutral-900/90 p-4 w-full overflow-x-auto">
              <code
                className={cn(
                  "font-mono text-sm text-neutral-100 leading-relaxed whitespace-pre-wrap break-words w-full",
                  className
                )}
                style={{
                  wordBreak: "break-all",
                  overflowWrap: "break-word",
                }}
                {...props}
              >
                {children}
              </code>
            </pre>
          )}
        </div>
        
        {/* Gradient overlay for long code blocks */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-900/20 to-transparent pointer-events-none rounded-b-lg"></div>
      </div>
    </div>
  );
});