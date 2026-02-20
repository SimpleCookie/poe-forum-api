export interface ForumCategory {
  name: string
  slug: string
  game: 'poe1' | 'poe2'
}

export const forumCategories: ForumCategory[] = [
  // PoE 1
  { name: 'Announcements', slug: 'news', game: 'poe1' },
  { name: 'Development Manifesto', slug: 'dev-manifesto', game: 'poe1' },
  { name: 'Patch Notes', slug: 'patch-notes', game: 'poe1' },

  // PoE 2
  { name: 'Early Access Announcements', slug: '2211', game: 'poe2' },
  { name: 'Early Access Patch Notes', slug: '2212', game: 'poe2' },
  { name: 'Early Access Feedback', slug: '2213', game: 'poe2' },
]

export const ALLOWED_CATEGORY_SLUGS = new Set(forumCategories.map((c) => c.slug))

export function assertAllowedCategory(slug: string) {
  if (!ALLOWED_CATEGORY_SLUGS.has(slug)) {
    throw new Error('Unsupported category')
  }
}
