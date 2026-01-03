/**
 * SanitizedMarkdown Component
 * Addresses CRITICAL-008: Markdown XSS vulnerability
 * Uses rehype-sanitize for XSS protection
 */

/* eslint-disable jsx-a11y/anchor-has-content -- ReactMarkdown provides content */
/* eslint-disable jsx-a11y/heading-has-content -- ReactMarkdown provides content */

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface SanitizedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Sanitized Markdown component with XSS protection
 * - rehype-sanitize removes dangerous HTML/JS after markdown parsing
 */
export const SanitizedMarkdown: React.FC<SanitizedMarkdownProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        rehypePlugins={[[rehypeSanitize]]}
        components={{
          // Ensure links open in new tab for external URLs
          a: ({ ...props }) => (
            <a
              {...props}
              target={props.href?.startsWith("http") ? "_blank" : undefined}
              rel={
                props.href?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            />
          ),
          // Add proper heading structure
          h1: ({ ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-6 mb-4" />
          ),
          h2: ({ ...props }) => (
            <h2 {...props} className="text-xl font-bold mt-5 mb-3" />
          ),
          h3: ({ ...props }) => (
            <h3 {...props} className="text-lg font-semibold mt-4 mb-2" />
          ),
          // Style code blocks
          code: (props) => {
            // Check if it's inline code by looking at className (inline code won't have language- class)
            const isInline = !props.className?.includes("language-");
            return isInline ? (
              <code
                {...props}
                className="bg-gray-800 px-1 py-0.5 rounded text-sm"
              />
            ) : (
              <code
                {...props}
                className="block bg-gray-800 p-4 rounded-lg overflow-x-auto"
              />
            );
          },
          // Style blockquotes
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-600 pl-4 italic"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default SanitizedMarkdown;
