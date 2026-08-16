import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type GlassCardProps = HTMLAttributes<HTMLDivElement>

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-md",
        "shadow-[0_0_30px_rgba(0,212,255,0.05)] transition-all duration-300",
        "hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
