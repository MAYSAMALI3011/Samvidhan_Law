import { apiClient } from '../client.ts'
import { isMockMode } from '../config.ts'
import { searchResultsSchema, safeValidate } from '../schemas.ts'
import type { SearchResults } from '../types.ts'

import { courses } from '../../data/mock/curriculum.ts'
import { lessons } from '../../data/mock/curriculum.ts'
import { constitutionTopics } from '../../data/mock/constitution.ts'
import { libraryDocuments } from '../../data/mock/library.ts'

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { courses: [], lessons: [], topics: [], documents: [] }
  }

  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const match = (text: string) => text.toLowerCase().includes(q)
    return {
      courses: courses.filter((c) => match(c.title) || match(c.description) || match(c.category)),
      lessons: lessons.filter((l) => match(l.title) || match(l.summary) || l.content.some(match)),
      topics: constitutionTopics.filter((t) => match(t.title) || match(t.summary) || match(t.part)),
      documents: libraryDocuments.filter(
        (d) => match(d.title) || match(d.summary) || d.tags.some(match) || match(d.category),
      ),
    }
  }

  try {
    const raw = await apiClient.get<unknown>('/api/search', { params: { q } })
    return safeValidate(searchResultsSchema, raw, 'searchService.searchAll', {
      courses: [],
      lessons: [],
      topics: [],
      documents: [],
    })
  } catch {
    return { courses: [], lessons: [], topics: [], documents: [] }
  }
}
