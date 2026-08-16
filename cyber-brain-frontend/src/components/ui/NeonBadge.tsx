import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type NeonBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Mã màu hex từ API (tb_tags.color) dùng cho Node 3D */
  color?: string
}

export function NeonBadge({ color = "#00d4ff", className, children, ...props }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        className,
      )}
      style={{
        color,
        borderColor: `${color}66`,
        backgroundColor: `${color}1a`,
        boxShadow: `0 0 12px ${color}33`,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
