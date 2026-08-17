import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

import { CameraRig } from '@/components/3d/CameraRig'
import { GraphLayer } from '@/components/3d/GraphLayer'
import { ParticleField } from '@/components/3d/ParticleField'
import { useGraphStore } from '@/store/graphStore'

function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.65} luminanceThreshold={0.18} luminanceSmoothing={0.85} mipmapBlur />
      <Vignette eskil={false} offset={0.22} darkness={0.82} />
    </EffectComposer>
  )
}

/** Scene 3D chính: vũ trụ knowledge graph */
export default function NexusScene() {
  const nodes = useGraphStore((s) => s.nodes)
  const setSelected = useGraphStore((s) => s.setSelected)

  return (
    <Canvas
      camera={{ fov: 60, position: [0, 0, 95], near: 0.1, far: 600 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={['#04060c']} />
      <fog attach="fog" args={['#04060c', 70, 260]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[50, 45, 50]} intensity={2.2} color="#00d4ff" distance={320} decay={1.6} />
      <pointLight position={[-50, -25, -35]} intensity={1.6} color="#8b5cf6" distance={320} decay={1.6} />

      <Suspense fallback={null}>
        <ParticleField />
        {nodes.length > 0 && <GraphLayer />}
        <CameraRig />
        <Effects />
      </Suspense>
    </Canvas>
  )
}
