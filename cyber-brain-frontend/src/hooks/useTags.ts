import { useEffect, useState } from 'react'

import { api } from '@/services/api'
import type { ApiResponse, TagResponse } from '@/types'

/** Cache danh sách tags cho Sidebar / TagPicker / Command Palette */
export function useTags() {
  const [tags, setTags] = useState<TagResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .get<ApiResponse<TagResponse[]>>('/tags')
      .then(({ data }) => {
        if (!cancelled) setTags(data.data)
      })
      .catch(() => {
        // tags là dữ liệu phụ, im lặng khi fail
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { tags, loading }
}
