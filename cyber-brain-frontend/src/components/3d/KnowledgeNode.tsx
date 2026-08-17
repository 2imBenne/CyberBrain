import { animated, useSpring } from '@react-spring/three'
import { Html } from '@react-three/drei'

import type { Node3D } from '@/store/graphStore'
import { useGraphStore } from '@/store/graphStore'

interface KnowledgeNodeProps {
  node: Node3D
}

/** Sphere 3D cho mỗi tag — emissive theo màu tag, hover phóng to bằng spring */
export function KnowledgeNode({ node }: KnowledgeNodeProps) {
  const hoveredId = useGraphStore((s) => s.hoveredId)
  const selectedId = useGraphStore((s) => s.selectedId)
  const setHovered = useGraphStore((s) => s.setHovered)
  const setSelected = useGraphStore((s) => s.setSelected)

  const isActive = hoveredId === node.id || selectedId === node.id
  const baseScale = 1 + Math.min(node.docCount, 10) * 0.1
  const radius = 2 + Math.min(node.docCount, 8) * 0.28

  const { springScale, emissiveIntensity } = useSpring({
    springScale: isActive ? baseScale * 1.4 : baseScale,
    emissiveIntensity: isActive ? 2.4 : 1.15,
    config: { tension: 180, friction: 18 },
  })

  return (
    <group position={node.position}>
      <animated.mesh
        scale={springScale}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(node.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(event) => {
          event.stopPropagation()
          setSelected(selectedId === node.id ? null : node.id)
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <animated.meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.55}
          transparent
          opacity={0.95}
        />
      </animated.mesh>

      {/* Ánh sáng bật lên khi hover */}
      {isActive && <pointLight color={node.color} intensity={2.5} distance={38} decay={2} position={[0, 0, 4]} />}

      {/* Nhãn tên node — luôn hiện với node lớn, hover hiện chi tiết */}
      <Html center distanceFactor={70} className="pointer-events-none select-none" zIndexRange={[10, 0]}>
        <div className="mt-9 whitespace-nowrap text-center">
          <span className="text-[11px] font-medium tracking-wide text-white/70" style={{ textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>
            {node.name}
          </span>
          {isActive && (
            <span className="ml-1.5 text-[10px]" style={{ color: node.color }}>
              · {node.docCount} doc
            </span>
          )}
        </div>
      </Html>
    </group>
  )
}
