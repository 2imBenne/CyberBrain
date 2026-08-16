// API models — khớp 1:1 với response của backend

export interface ApiResponse<T> {
  status: number
  data: T
  message: string
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface User {
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface TagLight {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
}

export interface TagResponse extends TagLight {
  parentId: number | null
  nodeX: number | null
  nodeY: number | null
  nodeZ: number | null
  docCount: number
}

export interface AuthorRef {
  id: number
  username: string
}

export interface DocumentSummary {
  id: number
  title: string
  slug: string
  summary: string | null
  isPublished: boolean
  isPinned: boolean
  viewCount: number
  author: AuthorRef | null
  tags: TagLight[]
  createdAt: string
  updatedAt: string
}

export interface DocumentResponse extends DocumentSummary {
  content: string
  contentHtml: string
  readingMinutes: number
}

export interface SearchHit {
  id: number
  title: string
  slug: string
  summary: string | null
  headline: string
  rank: number
}

export interface Suggestion {
  id: number
  title: string
  slug: string
}

export interface UserActivity {
  document: DocumentSummary
  timestamp: string
  durationSec: number | null
}

export type RelationType = 'RELATED_TO' | 'PREREQUISITE_OF' | 'PART_OF' | 'SEE_ALSO' | 'CO_OCCURS'

export interface GraphNode {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
  x: number
  y: number
  z: number
  docCount: number
}

export interface GraphEdge {
  source: number
  target: number
  relationType: RelationType
  weight: number
}

export interface GraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
