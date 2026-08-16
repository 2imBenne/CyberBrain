import { useEffect, useState } from 'react'

import { motion, useScroll, useSpring } from 'framer-motion'

/** Thanh tiến độ đọc phía trên cùng (scale theo scroll) */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => setVisible(value > 0.005))
    return () => unsubscribe()
  }, [scrollYProgress])

  if (!visible) return null

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.7)]"
    />
  )
}
