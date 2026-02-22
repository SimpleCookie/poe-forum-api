import { load as cheerioLoad } from 'cheerio'
import type { AnyNode, Element } from 'domhandler'

export type ContentBlockV5 =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | {
    type: 'embed'
    provider: 'youtube' | 'unknown'
    kind: 'video' | 'iframe'
    url: string
    embedUrl: string
    videoId?: string
  }
  | { type: 'quote'; author?: string; text: string }

export interface StructuredContentV5 {
  type: 'doc'
  blocks: ContentBlockV5[]
}

function isTextNode(node: AnyNode): node is AnyNode & { data: string } {
  return node.type === 'text' && typeof (node as { data?: unknown }).data === 'string'
}

function isElementNode(node: AnyNode): node is Element {
  return node.type === 'tag'
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00A0/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeUrl(url: string): string {
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  return url
}

function parseYoutube(url: string): { videoId?: string; canonicalUrl: string; embedUrl: string } {
  const normalized = normalizeUrl(url)
  const embedMatch = normalized.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/i)
  if (embedMatch) {
    const videoId = embedMatch[1]
    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }
  }

  const watchMatch = normalized.match(/[?&]v=([A-Za-z0-9_-]+)/i)
  if (watchMatch) {
    const videoId = watchMatch[1]
    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }
  }

  const shortMatch = normalized.match(/youtu\.be\/([A-Za-z0-9_-]+)/i)
  if (shortMatch) {
    const videoId = shortMatch[1]
    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }
  }

  return {
    canonicalUrl: normalized,
    embedUrl: normalized,
  }
}

export function toStructuredContentV5(contentHtml: string): StructuredContentV5 {
  const $ = cheerioLoad(`<div id="__content_root__">${contentHtml}</div>`)
  const root = $('#__content_root__')
  const blocks: ContentBlockV5[] = []

  let paragraphBuffer = ''

  const appendText = (text: string) => {
    if (text.length === 0) {
      return
    }
    const normalized = text.replace(/\s+/g, ' ')
    paragraphBuffer += normalized
  }

  const appendBreak = () => {
    if (paragraphBuffer.length > 0 && !paragraphBuffer.endsWith('\n')) {
      paragraphBuffer += '\n'
    }
  }

  const flushParagraph = () => {
    const text = normalizeWhitespace(paragraphBuffer)
    if (text.length > 0) {
      blocks.push({
        type: 'paragraph',
        text,
      })
    }
    paragraphBuffer = ''
  }

  const walk = (node: AnyNode) => {
    if (isTextNode(node)) {
      appendText(node.data)
      return
    }

    if (!isElementNode(node)) {
      return
    }

    const tagName = node.tagName.toLowerCase()
    const element = $(node)

    if (tagName === 'br') {
      appendBreak()
      return
    }

    if (tagName === 'img') {
      flushParagraph()
      const src = element.attr('src')
      if (!src) {
        return
      }
      blocks.push({
        type: 'image',
        url: normalizeUrl(src),
        ...(element.attr('alt') ? { alt: element.attr('alt') } : {}),
      })
      return
    }

    if (tagName === 'iframe') {
      flushParagraph()
      const src = element.attr('src')
      if (!src) {
        return
      }

      const normalized = normalizeUrl(src)
      const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(normalized)
      if (isYoutube) {
        const youtube = parseYoutube(normalized)
        blocks.push({
          type: 'embed',
          provider: 'youtube',
          kind: 'video',
          url: youtube.canonicalUrl,
          embedUrl: youtube.embedUrl,
          ...(youtube.videoId ? { videoId: youtube.videoId } : {}),
        })
      } else {
        blocks.push({
          type: 'embed',
          provider: 'unknown',
          kind: 'iframe',
          url: normalized,
          embedUrl: normalized,
        })
      }
      return
    }

    if (tagName === 'blockquote') {
      flushParagraph()
      const author = element.find('cite .profile-link a').first().text().trim()
      const quoteText = normalizeWhitespace(
        element.find('.bot').first().text() || element.text()
      )
      if (quoteText.length > 0) {
        blocks.push({
          type: 'quote',
          ...(author.length > 0 ? { author } : {}),
          text: quoteText,
        })
      }
      return
    }

    const isBlockLike = ['p', 'div', 'li', 'ul', 'ol'].includes(tagName)
    if (isBlockLike) {
      appendBreak()
    }

    node.children.forEach((child) => walk(child))

    if (isBlockLike) {
      appendBreak()
    }
  }

  root.contents().toArray().forEach((node) => walk(node))
  flushParagraph()

  if (blocks.length === 0) {
    return {
      type: 'doc',
      blocks: [{ type: 'paragraph', text: '' }],
    }
  }

  return {
    type: 'doc',
    blocks,
  }
}
