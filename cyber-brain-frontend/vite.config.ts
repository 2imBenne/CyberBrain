import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sinh stats.html sau mỗi build — mở để xem phân tích bundle
    visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js tách riêng ~290KB gzip — không load trên non-3D pages
          'three-core': ['three'],
          'three-fiber': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          'three-spring': ['@react-spring/three'],
          // Framer Motion + animation
          'framer': ['framer-motion'],
          // TipTap editor — chỉ load khi editor
          'tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-code-block-lowlight',
            '@tiptap/extension-image',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-table',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
            '@tiptap/extension-table-row',
            'tiptap-markdown',
          ],
          // Radix UI primitives
          'radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],
        },
      },
    },
  },
})
