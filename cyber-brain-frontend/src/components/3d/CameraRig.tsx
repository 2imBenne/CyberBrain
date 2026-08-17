import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'

import { useGraphStore } from '@/store/graphStore'

// Vị trí camera tổng quan mặc định
const OVERVIEW_POS = { x: 0, y: 0, z: 95 } as const
const OVERVIEW_TARGET = { x: 0, y: 0, z: 0 } as const

/** Camera: intro bay vào + orbit điều khiển + GSAP fly-to khi chọn node */
export function CameraRig() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const controls = useThree((state) => state.controls) as
    | { target: THREE.Vector3; update: () => void; enabled: boolean }
    | null
  const selectedId = useGraphStore((s) => s.selectedId)
  const nodes = useGraphStore((s) => s.nodes)
  const setSelected = useGraphStore((s) => s.setSelected)

  // Ref để biết lần trước có focus không (tránh fly-back khi init)
  const prevSelectedRef = useRef<number | null>(undefined as unknown as null)

  // Intro: bay từ xa vào giữa vũ trụ
  useEffect(() => {
    if (!camera) return
    gsap.fromTo(
      camera.position,
      { x: 0, y: 26, z: 165 },
      { x: OVERVIEW_POS.x, y: OVERVIEW_POS.y, z: OVERVIEW_POS.z, duration: 2.4, ease: 'power2.out' },
    )
  }, [camera])

  // Fly-to node khi được chọn, fly-back về overview khi deselect
  useEffect(() => {
    const isFirstRender = prevSelectedRef.current === undefined
    const prev = prevSelectedRef.current
    prevSelectedRef.current = selectedId

    if (isFirstRender) return

    if (selectedId !== null) {
      // ── Fly-to node đã chọn ──
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
    } else if (prev !== null) {
      // ── Fly-back về overview (chỉ khi trước đó đang focus) ──
      gsap.to(camera.position, {
        x: OVERVIEW_POS.x,
        y: OVERVIEW_POS.y,
        z: OVERVIEW_POS.z,
        duration: 1.4,
        ease: 'power2.inOut',
      })
      if (controls) {
        gsap.to(controls.target, {
          x: OVERVIEW_TARGET.x,
          y: OVERVIEW_TARGET.y,
          z: OVERVIEW_TARGET.z,
          duration: 1.4,
          ease: 'power2.inOut',
          onUpdate: () => controls.update(),
        })
      }
    }
  }, [selectedId, nodes, camera, controls])

  // Chuột phải: deselect node và fly-back overview
  useEffect(() => {
    const canvas = gl.domElement
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      if (useGraphStore.getState().selectedId !== null) {
        setSelected(null)
      }
    }
    canvas.addEventListener('contextmenu', handleContextMenu)
    return () => canvas.removeEventListener('contextmenu', handleContextMenu)
  }, [gl, setSelected])

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
