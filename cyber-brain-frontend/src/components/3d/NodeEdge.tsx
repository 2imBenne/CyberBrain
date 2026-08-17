import { useRef } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import type { Edge3D, Node3D } from '@/store/graphStore'

interface NodeEdgeProps {
  edge: Edge3D
  source: Node3D
  target: Node3D
  /** true khi edge nối vào node đang hover/select — tăng độ sáng */
  active: boolean
}

/** Đường nối giữa 2 node — opacity animate mượt theo trạng thái hover */
export function NodeEdge({ edge, source, target, active }: NodeEdgeProps) {
  const materialRef = useRef<THREE.Material | null>(null)
  const lineRef = useRef<unknown>(null)

  useFrame((_, delta) => {
    const material = (lineRef.current as { material?: THREE.LineBasicMaterial & { opacity: number } } | null)?.material
    if (material && material.transparent) {
      material.opacity = THREE.MathUtils.damp(material.opacity, active ? 0.8 : 0.16, 4, delta)
      materialRef.current = material
    }
  })

  return (
    <Line
      ref={lineRef as never}
      points={[source.position, target.position]}
      color={active ? '#00d4ff' : '#3ba7c8'}
      lineWidth={Math.min(3, 0.6 + edge.weight * 1.4)}
      transparent
      opacity={0.16}
      dashed={edge.relationType === 'PREREQUISITE_OF'}
      dashSize={2}
      gapSize={1.5}
    />
  )
}
