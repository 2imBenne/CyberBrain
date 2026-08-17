import { KnowledgeNode } from '@/components/3d/KnowledgeNode'
import { NodeEdge } from '@/components/3d/NodeEdge'
import { useGraphStore } from '@/store/graphStore'

/** Lớp graph: render toàn bộ nodes + edges vào scene */
export function GraphLayer() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const hoveredId = useGraphStore((s) => s.hoveredId)
  const selectedId = useGraphStore((s) => s.selectedId)
  const getConnectedNodes = useGraphStore((s) => s.getConnectedNodes)

  const focusId = hoveredId ?? selectedId
  const connected = focusId !== null ? new Set(getConnectedNodes(focusId)) : null

  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <group>
      {nodes.map((node) => (
        <KnowledgeNode key={node.id} node={node} />
      ))}

      {edges.flatMap((edge) => {
        const source = nodeById.get(edge.source)
        const target = nodeById.get(edge.target)
        if (!source || !target) return []
        const active =
          connected !== null &&
          (edge.source === focusId || edge.target === focusId)
        return [
          <NodeEdge
            key={edge.key}
            edge={edge}
            source={source}
            target={target}
            active={active}
          />,
        ]
      })}
    </group>
  )
}
