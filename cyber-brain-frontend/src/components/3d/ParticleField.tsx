import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const PALETTE = [new THREE.Color('#00d4ff'), new THREE.Color('#8b5cf6'), new THREE.Color('#ffffff'), new THREE.Color('#3b82f6')]

/** Nền vũ trụ: bụi sao additive trên vỏ cầu bán kính 30-130 */
export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const count = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 1200 : 3000), [])

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Phân bố đều trên vỏ cầu
      const radius = 30 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions, colors }
  }, [count])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008
      pointsRef.current.rotation.x += delta * 0.002
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.45}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
