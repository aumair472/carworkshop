import sanitizeHtml from 'sanitize-html'

// Pure-JS HTML sanitizer (no jsdom). isomorphic-dompurify was dropped because it
// pulls jsdom → html-encoding-sniffer → @exodus/bytes (ESM-only), which crashes
// the Node serverless runtime with ERR_REQUIRE_ESM on every route that sanitizes.
export function sanitizeHTML(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'a', 'blockquote', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      '*': ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowedStyles: {},
  })
}
