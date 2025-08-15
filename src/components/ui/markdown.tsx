import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "@/components/ui/code-block";
import "katex/dist/katex.min.css";

// Custom remark plugin to prevent code blocks from being wrapped in paragraphs
const remarkUnwrapCodeBlocks = () => {
  return (tree: any) => {
    const visit = (node: any, index: number, parent: any) => {
      // Add null checks to prevent errors
      if (!node || typeof node !== 'object') {
        return;
      }
      
      if (node.type === 'paragraph' && node.children && Array.isArray(node.children) && node.children.length === 1) {
        const child = node.children[0];
        if (child && child.type === 'code' && !child.inline) {
          // Replace the paragraph with the code block
          if (parent && parent.children && Array.isArray(parent.children)) {
            parent.children[index] = child;
          }
        }
      }
      
      // Safely visit children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any, childIndex: number) => {
          if (child) {
            visit(child, childIndex, node);
          }
        });
      }
    };
    
    // Add error handling
    try {
      visit(tree, 0, null);
    } catch (error) {
      console.warn('Error in remarkUnwrapCodeBlocks:', error);
    }
  };
};

// Custom rehype plugin to fix HTML structure
const rehypeUnwrapCodeBlocks = () => {
  return (tree: any) => {
    const visit = (node: any, index: number, parent: any) => {
      // Add null checks to prevent errors
      if (!node || typeof node !== 'object') {
        return;
      }
      
      if (node.type === 'element' && node.tagName === 'p') {
        // Check if paragraph contains only a pre element
        if (node.children && Array.isArray(node.children) && node.children.length === 1) {
          const child = node.children[0];
          if (child && child.type === 'element' && child.tagName === 'pre') {
            // Replace paragraph with pre element
            if (parent && parent.children && Array.isArray(parent.children)) {
              parent.children[index] = child;
            }
          }
        }
      }
      
      // Safely visit children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any, childIndex: number) => {
          if (child) {
            visit(child, childIndex, node);
          }
        });
      }
    };
    
    // Add error handling
    try {
      visit(tree, 0, null);
    } catch (error) {
      console.warn('Error in rehypeUnwrapCodeBlocks:', error);
    }
  };
};

const preprocessNumberFormatting = (content: string): string => {
  try {
    let processed = content;

    processed = processed.replace(
      /(\d+(?:\.\d+)?)(billion|million|trillion|B|M|T)(?=\s|$)/gi,
      "$1 $2"
    );
    processed = processed.replace(/(\d{4})(to|by|in)(\d{4})/gi, "$1 $2 $3");

    // Only add spaces for actual currency patterns (no space between $ and number)
    processed = processed.replace(/(\$)(\d+(?:\.\d+)?)/g, "$1 $2");

    return processed;
  } catch (error) {
    console.warn("Error in number formatting:", error);
    return content;
  }
};

const latexMatrixRegex =
  /\\begin\{(pmatrix|bmatrix|matrix)\}([\s\S]*?)\\end\{\1\}/g;

function latexMatrixToAsciiTable(latex: string): string {
  try {
    // Split rows by \\ and cells by &
    return latex
      .trim()
      .split("\\\\")
      .map(
        (row) =>
          "| " +
          row
            .trim()
            .split("&")
            .map((cell) => cell.trim())
            .join("  ") +
          " |"
      )
      .join("\n");
  } catch (error) {
    console.warn("Error converting LaTeX matrix:", error);
    return latex;
  }
}

const preprocessMathContent = (content: string): string => {
  try {
    let processed = content;

    // 1. Convert LaTeX matrices to ASCII/markdown tables (per MATRIX_FORMATTING_RULE)
    processed = processed.replace(
      latexMatrixRegex,
      (match, _type, matrixContent) => {
        return latexMatrixToAsciiTable(matrixContent);
      }
    );

    // 2. Block math normalization (for non-matrix math)
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, expr) => {
      if (expr.trim().length > 1000) {
        console.warn("Skipping very long math expression");
        return match;
      }
      return `\n\n$$${expr.trim()}$$\n\n`;
    });

    processed = processed.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (match, expr) => {
      if (expr.trim().length > 1000) {
        console.warn("Skipping very long math expression");
        return match;
      }
      return `\n\n$$${expr.trim()}$$\n\n`;
    });

    // 3. Inline math normalization
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, expr) => {
      if (expr.trim().length > 200) {
        console.warn("Skipping very long inline math expression");
        return match;
      }
      return `$${expr.trim()}$`;
    });

    processed = processed.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (match, expr) => {
      if (expr.trim().length > 200) {
        console.warn("Skipping very long inline math expression");
        return match;
      }
      return `$${expr.trim()}$`;
    });

    return processed;
  } catch (error) {
    console.warn("Error in math content preprocessing:", error);
    return content;
  }
};

const preprocessTableContent = (content: string): string => {
  try {
    // Convert text-based tables to proper markdown tables
    const lines = content.split("\n");
    const processedLines: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line looks like a table row (starts and ends with |)
      if (line.startsWith("|") && line.endsWith("|") && line.includes("|")) {
        if (!inTable) {
          inTable = true;
          tableLines = [];
        }

        // Clean up the line - remove extra spaces and dashes
        const cleanLine = line
          .replace(/\|\s*-+\s*\|/g, "|---|") // Convert dash separators
          .replace(/\|\s*-+\s*/g, "|---") // Convert dash separators at start/end
          .replace(/\s*-+\s*\|/g, "---|") // Convert dash separators at start/end
          .replace(/\s+/g, " ") // Normalize spaces
          .trim();

        tableLines.push(cleanLine);
      } else {
        if (inTable && tableLines.length > 0) {
          // We've finished a table, process it
          if (tableLines.length >= 2) {
            // Add header separator if not present
            const hasHeaderSeparator = tableLines[1].includes("---");
            if (!hasHeaderSeparator) {
              const headerCols = tableLines[0].split("|").length - 2;
              const separator =
                "|" + Array(headerCols).fill("---").join("|") + "|";
              tableLines.splice(1, 0, separator);
            }
          }
          processedLines.push(...tableLines);
          tableLines = [];
          inTable = false;
        }
        processedLines.push(line);
      }
    }

    // Handle case where table is at the end
    if (inTable && tableLines.length > 0) {
      if (tableLines.length >= 2) {
        const hasHeaderSeparator = tableLines[1].includes("---");
        if (!hasHeaderSeparator) {
          const headerCols = tableLines[0].split("|").length - 2;
          const separator = "|" + Array(headerCols).fill("---").join("|") + "|";
          tableLines.splice(1, 0, separator);
        }
      }
      processedLines.push(...tableLines);
    }

    return processedLines.join("\n");
  } catch (error) {
    console.warn("Error in table preprocessing:", error);
    return content;
  }
};

const components: Partial<Components> = {
  code: (props: React.ComponentProps<"code"> & { inline?: boolean }) => {
    // If this is a block code (not inline), render it directly without paragraph wrapping
    if (!props.inline) {
      return (
        <CodeBlock
          inline={props.inline ?? false}
          className={props.className ?? ""}
          {...props}
        >
          {props.children}
        </CodeBlock>
      );
    }
    
    // For inline code, render normally
    return (
      <CodeBlock
        inline={props.inline ?? false}
        className={props.className ?? ""}
        {...props}
      >
        {props.children}
      </CodeBlock>
    );
  },
  pre: ({ children }) => <>{children}</>,
  p: ({ children, ...props }) => {
    // Check if the paragraph contains only a code block or pre element
    const hasOnlyCodeBlock = React.Children.count(children) === 1 && 
      React.isValidElement(children) && 
      (children.type === 'pre' || children.type === CodeBlock);
    
    if (hasOnlyCodeBlock) {
      // Return the code block directly without paragraph wrapper
      return <>{children}</>;
    }
    
    // Check if all children are code blocks
    const allChildren = React.Children.toArray(children);
    const allAreCodeBlocks = allChildren.length > 0 && 
      allChildren.every(child => 
        React.isValidElement(child) && 
        (child.type === 'pre' || child.type === CodeBlock)
      );
    
    if (allAreCodeBlocks) {
      // Return code blocks directly without paragraph wrapper
      return <>{children}</>;
    }
    
    // Normal paragraph rendering
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-4 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </p>
    );
  },
  table: ({ children, ...props }) => (
    <div className="w-full overflow-x-auto my-6">
      <table
        className="min-w-full border-collapse border border-neutral-600/50 bg-neutral-800/30 rounded-lg overflow-hidden backdrop-blur-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gradient-to-r from-neutral-700 to-neutral-800" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr className="border-b border-neutral-600/30 last:border-b-0 hover:bg-neutral-700/20 transition-colors" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-r border-neutral-600/30 last:border-r-0 px-4 py-3 text-left font-semibold text-white"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-r border-neutral-600/30 last:border-r-0 px-4 py-3 text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </td>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside ml-6 space-y-2 my-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </li>
  ),
  ul: ({ children, ...props }) => (
    <ul className="space-y-2 ml-0 my-4" {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === "li") {
          return (
            <li key={index} className="flex items-start leading-7">
              <span className="text-blue-400 mr-3 mt-0.5 select-none text-lg">•</span>
              <span className="flex-1 text-gray-900 dark:text-gray-100">
                {
                  (child as React.ReactElement<{ children: React.ReactNode }>)
                    .props.children
                }
              </span>
            </li>
          );
        }
        return child;
      })}
    </ul>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-gray-700 dark:text-neutral-200" {...props}>
      {children}
    </em>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-6 text-white border-b border-neutral-700/50 pb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4 text-white" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3 text-white" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-semibold mt-6 mb-2 text-white" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-base font-semibold mt-4 mb-2 text-white" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-sm font-semibold mt-4 mb-2 text-white" {...props}>
      {children}
    </h6>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-500/50 pl-6 italic my-6 bg-neutral-800/30 rounded-r-lg py-4 backdrop-blur-sm"
      {...props}
    >
      <div className="text-gray-900 dark:text-gray-200">
        {children}
      </div>
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-neutral-700/50" {...props} />
  ),
  img: ({ src, alt, ...props }) => (
    <div className="my-6">
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-neutral-700/50 shadow-lg"
        {...props}
      />
      {alt && (
        <p className="text-sm text-neutral-400 text-center mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  ),
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const processedContent = useMemo(() => {
    try {
      // Skip processing for very large content to prevent performance issues
      if (children.length > 50000) {
        console.warn("Skipping preprocessing for very large content");
        return children;
      }

      const formattedContent = preprocessNumberFormatting(children);
      const mathProcessedContent = preprocessMathContent(formattedContent);
      return preprocessTableContent(mathProcessedContent);
    } catch (error) {
      console.warn("Error processing markdown content:", error);
      return children;
    }
  }, [children]);

  return (
    <div className="max-w-full overflow-x-auto pl-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkUnwrapCodeBlocks()]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeUnwrapCodeBlocks()]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);