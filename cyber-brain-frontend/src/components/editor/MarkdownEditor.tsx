import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'
import 'highlight.js/styles/github-dark.css'
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Table as TableIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const lowlight = createLowlight(common)

interface MarkdownEditorProps {
  content: string
  onChange: (markdown: string, html: string) => void
}

interface ToolbarAction {
  icon: React.ComponentType<{ className?: string }>
  title: string
  active?: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const toolbarActions: ToolbarAction[] = [
  { icon: Heading1, title: 'Tiêu đề 1', active: (e) => e.isActive('heading', { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { icon: Heading2, title: 'Tiêu đề 2', active: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: Heading3, title: 'Tiêu đề 3', active: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { icon: Bold, title: 'Đậm', active: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { icon: Italic, title: 'Nghiêng', active: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { icon: Strikethrough, title: 'Gạch ngang', active: (e) => e.isActive('strike'), run: (e) => e.chain().focus().toggleStrike().run() },
  { icon: Code, title: 'Code inline', active: (e) => e.isActive('code'), run: (e) => e.chain().focus().toggleCode().run() },
  { icon: Code2, title: 'Code block', active: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { icon: List, title: 'Danh sách', active: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { icon: ListOrdered, title: 'Danh sách số', active: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: Quote, title: 'Trích dẫn', active: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
]

/** TipTap editor xuất Markdown (tiptap-markdown) + toolbar mini */
export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: 'Viết tài liệu bằng Markdown...' }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Markdown.configure({ html: false, breaks: true, linkify: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown(), editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content prose prose-invert max-w-none min-h-[55vh] focus:outline-none px-4 py-3',
      },
    },
  })

  if (!editor) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted/40" />
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card/40">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/20 px-2 py-1.5">
        {toolbarActions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', action.active?.(editor) && 'bg-accent/20 text-neon-cyan')}
            title={action.title}
            onClick={() => action.run(editor)}
            type="button"
          >
            <action.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="mx-1 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Chèn bảng"
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Chèn ảnh theo URL"
          type="button"
          onClick={() => {
            const url = window.prompt('URL hình ảnh:')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  )
}
