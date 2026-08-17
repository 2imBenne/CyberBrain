import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'

import { useGraphStore } from '@/store/graphStore'

/** Camera: intro bay vào + orbit điều khiển + GSAP fly-to khi chọn node */
export function CameraRig() {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as
    | { target: THREE.Vector3; update: () => void }
    | null
  const selectedId = useGraphStore((s) => s.selectedId)
  const nodes = useGraphStore((s) => s.nodes)

  // Intro: bay từ xa vào giữa vũ trụ
  useEffect(() => {
    if (!camera) return
    gsap.fromTo(
      camera.position,
      { x: 0, y: 26, z: 165 },
      { x: 0, y: 0, z: 95, duration: 2.4, ease: 'power2.out' },
    )
  }, [camera])

  // Fly-to node khi được chọn
  useEffect(() => {
    const node = nodes.find((item) => item.id === selectedId)
    if (!node || !controls) return
    const [x, y, z] = node.position
    gsap.to(camera.position, {
      x: x * 1.12,
      y: y * 1.12,
      z: z * 1.12 + 30,
      duration: 1.2,
      ease: 'power2.inOut',
    })
    gsap.to(controls.target, {
      x,
      y,
      z,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    })
  }, [selectedId, nodes, camera, controls])

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      minDistance={18}
      maxDistance={230}
      enablePan={false}
    />
  )
}
