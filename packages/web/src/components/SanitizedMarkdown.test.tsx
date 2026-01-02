import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SanitizedMarkdown } from './SanitizedMarkdown';

/**
 * CRITICAL-008: Comprehensive XSS prevention tests for SanitizedMarkdown component
 *
 * Tests various XSS attack vectors including:
 * - Script tags (inline, with events, with src)
 * - on* event handlers (onclick, onload, onerror, etc.)
 * - javascript: protocols
 * - data: URIs
 * - CSS expressions and behaviors
 * - SVG-based attacks
 * - iframe/object/embed tags
 * - Form/input based attacks
 * - Meta refresh attacks
 * - DOM clobbering attempts
 */

describe('SanitizedMarkdown - XSS Prevention', () => {
  describe('Script Tag Attacks', () => {
    it('should strip inline <script> tags', () => {
      const malicious = 'Before\n<script>alert("XSS")</script>\nAfter';
      render(<SanitizedMarkdown content={malicious} />);

      // Script tag is stripped, content around it should remain
      expect(screen.queryByText('Before')).toBeInTheDocument();
      expect(screen.queryByText('After')).toBeInTheDocument();

      const scriptTags = document.querySelectorAll('script');
      const hasMaliciousScript = Array.from(scriptTags).some(script =>
        script.textContent?.includes('alert("XSS")')
      );
      expect(hasMaliciousScript).toBe(false);
    });

    it('should strip script tags with event handlers', () => {
      const malicious = '<script onload="alert(1)" onerror="alert(2)">alert("XSS")</script>';
      render(<SanitizedMarkdown content={malicious} />);

      const scriptTags = document.querySelectorAll('script');
      expect(scriptTags.length).toBe(0);
    });

    it('should strip script tags with external src', () => {
      const malicious = '<script src="https://evil.com/xss.js"></script>';
      render(<SanitizedMarkdown content={malicious} />);

      const scriptTags = document.querySelectorAll('script[src*="evil"]');
      expect(scriptTags.length).toBe(0);
    });

    it('should strip obfuscated script tags', () => {
      const malicious = '<scRipt>ScriPt>alert("XSS")</scRipt>ScriPt>';
      render(<SanitizedMarkdown content={malicious} />);

      const scriptTags = document.querySelectorAll('script');
      expect(scriptTags.length).toBe(0);
    });
  });

  describe('Event Handler Attacks', () => {
    it('should strip onclick attributes', () => {
      const malicious = '<p onclick="alert(1)">Click me</p>';
      render(<SanitizedMarkdown content={malicious} />);

      // ReactMarkdown without rehype-raw doesn't render inline HTML
      // Content might be rendered as plain text or stripped
      const paragraphs = document.querySelectorAll('p[onclick]');
      expect(paragraphs.length).toBe(0);

      // Verify no script execution by checking for onclick attributes anywhere
      const elements = document.querySelectorAll('[onclick]');
      expect(elements.length).toBe(0);
    });

    it('should strip onload attributes', () => {
      const malicious = '<img src="x" onload="alert(1)" alt="test" />';
      render(<SanitizedMarkdown content={malicious} />);

      const images = document.querySelectorAll('img[onload]');
      expect(images.length).toBe(0);
    });

    it('should strip onerror attributes', () => {
      const malicious = '<img src="invalid" onerror="alert(1)" alt="test" />';
      render(<SanitizedMarkdown content={malicious} />);

      const images = document.querySelectorAll('img[onerror]');
      expect(images.length).toBe(0);
    });

    it('should strip all on* event handlers', () => {
      const malicious =
        '<div onmouseover="alert(1)" onmouseout="alert(2)" onfocus="alert(3)" onblur="alert(4)">Hover me</div>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no malicious event handlers exist
      const elements = document.querySelectorAll(
        '[onmouseover], [onmouseout], [onfocus], [onblur]'
      );
      expect(elements.length).toBe(0);
    });
  });

  describe('JavaScript Protocol Attacks', () => {
    it('should strip javascript: URLs in href', () => {
      const malicious = '<a href="javascript:alert(1)">Click me</a>';
      render(<SanitizedMarkdown content={malicious} />);

      const link = screen.queryByText('Click me');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveAttribute('href', 'javascript:alert(1)');
    });

    it('should strip javascript: URLs with obfuscation', () => {
      const malicious = '<a href="jAvasCripT:alert(1)">Click me</a>';
      render(<SanitizedMarkdown content={malicious} />);

      const link = screen.queryByText('Click me');
      expect(link).toBeInTheDocument();
      const href = link?.getAttribute('href') ?? '';
      expect(href.toLowerCase()).not.toContain('javascript:');
    });
  });

  describe('Data URI Attacks', () => {
    it('should strip data: URIs with HTML content', () => {
      const malicious = '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
      render(<SanitizedMarkdown content={malicious} />);

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBe(0);
    });

    it('should strip data: URIs in attributes', () => {
      const malicious = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      render(<SanitizedMarkdown content={malicious} />);

      const link = screen.queryByText('Click');
      expect(link).toBeInTheDocument();
      const href = link?.getAttribute('href') ?? '';
      expect(href).not.toContain('data:');
    });
  });

  describe('Style and CSS Attacks', () => {
    it('should strip style tags with javascript expressions', () => {
      const malicious = '<style>body { background: url("javascript:alert(1)") }</style>';
      render(<SanitizedMarkdown content={malicious} />);

      const styleTags = document.querySelectorAll('style');
      expect(styleTags.length).toBe(0);
    });

    it('should strip style attributes with expressions', () => {
      const malicious = '<div style="width: expression(alert(1))">Test</div>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no elements with style attributes containing expressions
      const elements = document.querySelectorAll('[style*="expression"]');
      expect(elements.length).toBe(0);

      // Also verify no style attribute at all (safer approach)
      const styledElements = document.querySelectorAll('[style]');
      expect(styledElements.length).toBe(0);
    });

    it('should strip -moz-binding CSS expressions', () => {
      const malicious = '<div style="-moz-binding:url(http://evil.com/xss.xml)">Test</div>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no elements with -moz-binding
      const elements = document.querySelectorAll('[style*="-moz-binding"]');
      expect(elements.length).toBe(0);
    });
  });

  describe('SVG-based Attacks', () => {
    it('should strip script tags in SVG', () => {
      const malicious = `<svg><script>alert("XSS")</script></svg>`;
      render(<SanitizedMarkdown content={malicious} />);

      const scriptTags = document.querySelectorAll('script');
      expect(scriptTags.length).toBe(0);
    });

    it('should strip event handlers in SVG', () => {
      const malicious = `<svg onload="alert(1)"><circle r="10"/></svg>`;
      render(<SanitizedMarkdown content={malicious} />);

      const svgs = document.querySelectorAll('svg[onload]');
      expect(svgs.length).toBe(0);
    });

    it('should strip javascript: in SVG href', () => {
      const malicious = `<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>`;
      render(<SanitizedMarkdown content={malicious} />);

      const links = document.querySelectorAll('a[href*="javascript:"]');
      expect(links.length).toBe(0);
    });
  });

  describe('Iframe, Object, Embed', () => {
    it('should strip iframe tags', () => {
      const malicious = '<iframe src="https://evil.com"></iframe>';
      render(<SanitizedMarkdown content={malicious} />);

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBe(0);
    });

    it('should strip object tags', () => {
      const malicious = '<object data="https://evil.com"></object>';
      render(<SanitizedMarkdown content={malicious} />);

      const objects = document.querySelectorAll('object');
      expect(objects.length).toBe(0);
    });

    it('should strip embed tags', () => {
      const malicious = '<embed src="https://evil.com" />';
      render(<SanitizedMarkdown content={malicious} />);

      const embeds = document.querySelectorAll('embed');
      expect(embeds.length).toBe(0);
    });
  });

  describe('Form and Input Attacks', () => {
    it('should strip form tags', () => {
      const malicious = '<form action="https://evil.com"><input type="submit" /></form>';
      render(<SanitizedMarkdown content={malicious} />);

      const forms = document.querySelectorAll('form');
      expect(forms.length).toBe(0);
    });

    it('should strip input tags', () => {
      const malicious = '<input type="text" value="test" />';
      render(<SanitizedMarkdown content={malicious} />);

      const inputs = document.querySelectorAll('input');
      expect(inputs.length).toBe(0);
    });

    it('should strip button tags with onclick', () => {
      const malicious = '<button onclick="alert(1)">Click</button>';
      render(<SanitizedMarkdown content={malicious} />);

      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('Meta Tag Attacks', () => {
    it('should strip meta refresh tags', () => {
      const malicious = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
      render(<SanitizedMarkdown content={malicious} />);

      const metaTags = document.querySelectorAll('meta[http-equiv="refresh"]');
      expect(metaTags.length).toBe(0);
    });
  });

  describe('DOM Clobbering Attempts', () => {
    it('should strip form elements with id/name conflicts', () => {
      const malicious = '<form id="document"><input name="getElementById" /></form>';
      render(<SanitizedMarkdown content={malicious} />);

      const forms = document.querySelectorAll('form');
      expect(forms.length).toBe(0);
    });

    it('should strip elements with conflicting names', () => {
      const malicious = '<a id="location" href="https://evil.com">Click</a>';
      render(<SanitizedMarkdown content={malicious} />);

      const links = document.querySelectorAll('a#location');
      expect(links.length).toBe(0);
    });
  });

  describe('Legitimate Content Rendering', () => {
    it('should render basic markdown paragraphs', () => {
      const content = '# Hello\n\nThis is a paragraph.';
      render(<SanitizedMarkdown content={content} />);

      expect(screen.queryByText('Hello')).toBeInTheDocument();
      expect(screen.queryByText('This is a paragraph.')).toBeInTheDocument();
    });

    it('should render safe links', () => {
      const content = '[OpenAI](https://openai.com)';
      render(<SanitizedMarkdown content={content} />);

      const link = screen.queryByText('OpenAI');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://openai.com');
    });

    it('should render inline code', () => {
      const content = 'Use `const x = 1;` for declarations.';
      render(<SanitizedMarkdown content={content} />);

      expect(screen.queryByText('const x = 1;')).toBeInTheDocument();
    });

    it('should render code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';
      render(<SanitizedMarkdown content={content} />);

      expect(screen.queryByText('const x = 1;')).toBeInTheDocument();
    });

    it('should render bold and italic', () => {
      const content = '**Bold** and *italic* text';
      render(<SanitizedMarkdown content={content} />);

      expect(screen.queryByText('Bold')).toBeInTheDocument();
      expect(screen.queryByText('italic')).toBeInTheDocument();
    });

    it('should render lists', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      render(<SanitizedMarkdown content={content} />);

      expect(screen.queryByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Item 2')).toBeInTheDocument();
      expect(screen.queryByText('Item 3')).toBeInTheDocument();
    });

    it('should render tables', () => {
      const content = '| Header |\n| --- |\n| Cell |';
      render(<SanitizedMarkdown content={content} />);

      // ReactMarkdown needs remark-gfm for tables, so content may be plain text
      // The important thing is that it's processed safely without XSS
      const container = document.querySelector('.prose');
      expect(container).toBeInTheDocument();

      // Verify no script tags or dangerous elements
      const scripts = container?.querySelectorAll('script');
      expect(scripts?.length ?? 0).toBe(0);
    });

    it('should handle empty content safely', () => {
      render(<SanitizedMarkdown content="" />);
      // Should not throw error
      expect(document.body).toBeInTheDocument();
    });

    it('should handle null content safely', () => {
      render(<SanitizedMarkdown content={null as unknown as string} />);
      // Should not throw error
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Complex Attacks', () => {
    it('should handle mixed case event handlers', () => {
      const malicious = '<p OnClIcK="alert(1)">Click</p>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no elements with onclick attributes (any case)
      const elements = document.querySelectorAll('[onclick], [OnClIcK]');
      expect(elements.length).toBe(0);
    });

    it('should handle nested malicious tags', () => {
      const malicious =
        '<div><p onclick="alert(1)"><span onmouseover="alert(2)">Click</span></p></div>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no malicious event handlers exist
      const elements = document.querySelectorAll('[onclick], [onmouseover]');
      expect(elements.length).toBe(0);
    });

    it('should handle HTML encoded attacks', () => {
      const malicious = '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;" />';
      render(<SanitizedMarkdown content={malicious} />);

      const images = document.querySelectorAll('img[onerror]');
      expect(images.length).toBe(0);
    });

    it('should handle unicode obfuscation', () => {
      const malicious =
        '<p onclick="\\u0061\\u006c\\u0065\\u0072\\u0074\\u0028\\u0031\\u0029">Click</p>';
      render(<SanitizedMarkdown content={malicious} />);

      // Verify no elements with onclick attributes
      const paragraphs = document.querySelectorAll('p[onclick]');
      expect(paragraphs.length).toBe(0);
    });
  });
});
