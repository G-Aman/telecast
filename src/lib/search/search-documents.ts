import type { ChannelPost } from '@/lib/types'

export interface SearchDocument {
  id: string
  title: string
  text: string
  tags: string
  datetime: string
}

function stripHtmlTags(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toSearchDocument(post: ChannelPost): SearchDocument {
  const tagText = post.tags
    .flatMap(tag => [tag, `#${tag}`])
    .join(' ')
  const attachmentText = post.attachments
    ?.flatMap(attachment => [attachment.name, attachment.size])
    .filter(Boolean)
    .join(' ') || ''

  return {
    id: post.id,
    title: post.title || '',
    text: [post.text, stripHtmlTags(post.content), attachmentText].filter(Boolean).join(' '),
    tags: tagText,
    datetime: post.datetime,
  }
}

export function buildPostSearchDataset(posts: ChannelPost[]) {
  const postsById = new Map<string, ChannelPost>()
  const documents: SearchDocument[] = []

  for (const post of posts) {
    if (!post?.id || postsById.has(post.id)) {
      continue
    }

    postsById.set(post.id, post)
    documents.push(toSearchDocument(post))
  }

  return {
    postsById,
    documents,
  }
}
