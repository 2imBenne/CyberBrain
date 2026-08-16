import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TagLight } from '@/types'

interface TagPickerProps {
  allTags: TagLight[]
  selected: TagLight[]
  onChange: (next: TagLight[]) => void
}

/** Combobox multi-select tags theo style shadcn (Popover + Command) */
export function TagPicker({ allTags, selected, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false)

  function toggle(tag: TagLight) {
    const exists = selected.some((t) => t.id === tag.id)
    onChange(exists ? selected.filter((t) => t.id !== tag.id) : [...selected, tag])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.map((tag) => (
        <button key={tag.id} type="button" onClick={() => toggle(tag)} title="Bỏ tag">
          <NeonBadge color={tag.color} className="cursor-pointer hover:opacity-70">
            {tag.name} ✕
          </NeonBadge>
        </button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Thêm tag <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm tag..." />
            <CommandList>
              <CommandEmpty>Không có tag</CommandEmpty>
              <CommandGroup>
                {allTags.map((tag) => {
                  const isSelected = selected.some((t) => t.id === tag.id)
                  return (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => toggle(tag)}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="flex-1 truncate">{tag.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-neon-cyan" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length === 0 && <Badge variant="outline">Chưa gán tag</Badge>}
    </div>
  )
}
