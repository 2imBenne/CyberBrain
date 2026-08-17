import { create } from 'zustand'
import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force-3d'

import { api } from '@/services/api'
import type { ApiResponse, GraphResponse } from '@/types'

export interface Node3D {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
  docCount: number
  position: [number, number, number]
}

export interface Edge3D {
  key: string
  source: number
  target: number
  relationType: string
  weight: number
}

interface GraphState {
  nodes: Node3D[]
  edges: Edge3D[]
  loading: boolean
  error: string
  hoveredId: number | null
  selectedId: number | null
  fetchGraph: () => Promise<void>
  setHovered: (id: number | null) => void
  setSelected: (id: number | null) => void
  getConnectedNodes: (nodeId: number) => number[]
  fetchDocumentSubgraph: (docId: number, depth?: number) => Promise<{ nodes: DocSubNode[]; edges: Edge3D[] } | null>
}

export interface DocSubNode {
  id: number
  title: string
  slug: string
  viewCount: number
}

/** Chạy force-simulation 3D (seed từ tọa độ server) rồi lưu layout ngược về DB */
function refineLayout(nodes: Node3D[], edges: Edge3D[]): Node3D[] {
  if (nodes.length === 0) return nodes

  try {
    const simNodes = nodes.map((node) => ({
      id: node.id,
      x: node.position[0],
      y: node.position[1],
      z: node.position[2],
    }))
    const simLinks = edges.map((edge) => ({ source: edge.source, target: edge.target, weight: edge.weight }))

    forceSimulation(simNodes, 3)
      .force(
        'link',
        forceLink(simLinks)
          .id((node) => node.id as number)
          .distance((link) => Math.max(16, 42 - link.weight * 8))
          .strength((link) => Math.min(0.5, 0.15 + link.weight * 0.1)),
      )
      .force('charge', forceManyBody().strength(-140))
      .force('center', forceCenter(0, 0, 0))
      .stop()
      .tick(120)

    const positions = new Map<number, [number, number, number]>()
    for (const node of simNodes) {
      positions.set(node.id as number, [
        Number((node.x ?? 0).toFixed(3)),
        Number((node.y ?? 0).toFixed(3)),
        Number((node.z ?? 0).toFixed(3)),
      ])
    }
    return nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position }))
  } catch {
    return nodes
  }
}

function persistLayout(nodes: Node3D[]) {
  // Fire-and-forget: lưu layout để session sau thấy graph giống hệt
  api
    .patch('/graph/layout', {
      nodes: nodes.map((node) => ({ id: node.id, x: node.position[0], y: node.position[1], z: node.position[2] })),
    })
    .catch(() => undefined)
}

export const useGraphStore = create<GraphState>()((set, get) => ({
  nodes: [],
  edges: [],
  loading: true,
  error: '',

  hoveredId: null,
  selectedId: null,

  fetchGraph: async () => {
    set({ loading: true, error: '' })
    try {
      const { data } = await api.get<ApiResponse<GraphResponse>>('/graph')
      const rawNodes = data.data.nodes
      const rawEdges = data.data.edges

      const baseNodes: Node3D[] = rawNodes.map((node) => ({
        id: node.id,
        name: node.name,
        slug: node.slug,
        color: node.color,
        icon: node.icon,
        docCount: node.docCount,
        position: [node.x, node.y, node.z],
      }))
      const edges: Edge3D[] = rawEdges.map((edge, index) => ({
        key: `${edge.source}-${edge.target}-${edge.relationType}-${index}`,
        source: edge.source,
        target: edge.target,
        relationType: edge.relationType,
        weight: edge.weight,
      }))

      const nodes = refineLayout(baseNodes, edges)
      if (nodes.length > 0) {
        persistLayout(nodes)
      }
      set({ nodes, edges, loading: false })
    } catch {
      set({ error: 'Không tải được knowledge graph', loading: false })
    }
  },

  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),

  getConnectedNodes: (nodeId) => {
    const { edges } = get()
    const connected = new Set<number>()
    for (const edge of edges) {
      if (edge.source === nodeId) connected.add(edge.target)
      if (edge.target === nodeId) connected.add(edge.source)
    }
    return [...connected]
  },

  fetchDocumentSubgraph: async (docId, depth = 2) => {
    try {
      const { data } = await api.get<ApiResponse<{
        nodes: DocSubNode[]
        edges: { source: number; target: number; relationType: string; weight: number }[]
        depth: number
      }>>(`/graph/document/${docId}`, { params: { depth } })
      return {
        nodes: data.data.nodes,
        edges: data.data.edges.map((edge, index) => ({
          key: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          relationType: edge.relationType,
          weight: edge.weight,
        })),
      }
    } catch {
      return null
    }
  },
}))
