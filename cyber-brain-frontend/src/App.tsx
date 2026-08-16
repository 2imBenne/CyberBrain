import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/GlassCard"
import { NeonBadge } from "@/components/ui/NeonBadge"

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <GlassCard className="space-y-6 p-10 text-center">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-neon-cyan drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">
            CYBER-BRAIN
          </h1>
          <p className="text-sm text-muted-foreground">
            Second Brain · Multi-user · Phase 0 — Foundation Online
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <NeonBadge color="#00d4ff">Spring Boot</NeonBadge>
            <NeonBadge color="#61dafb">React 18</NeonBadge>
            <NeonBadge color="#8b5cf6">Three.js</NeonBadge>
            <NeonBadge color="#39ff14">PostgreSQL</NeonBadge>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="neon">Enter the Nexus</Button>
            <Button variant="outline">Documentation</Button>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  )
}

export default App
