import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { className, children, ...rest } = props;
          // @ts-expect-error - react-markdown provides inline property but it's not in the types
          const { inline } = props;
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match || inline;
          
          return (
            <CodeBlock
              inline={isInline}
              className={className}
              {...rest}
            >
              {children}
            </CodeBlock>
          );
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-neutral-700 pl-4 py-2 my-4 bg-neutral-800/50 rounded-r">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-neutral-700">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-neutral-700 px-3 py-2 bg-neutral-800 font-semibold text-left">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-neutral-700 px-3 py-2">
              {children}
            </td>
          );
        },
      } as Components}
    >
      {children}
    </ReactMarkdown>
  );
}