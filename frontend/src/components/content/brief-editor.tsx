import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react'
import type { Brief } from '@/api/generated/model'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EMPTY_BRIEF: Brief = { type: 'doc', content: [] }

/**
 * The rich-text brief (angle, sources, notes). Reports every change through
 * `onChange`; the form around it decides when to save. Read-only when
 * `editable` is false.
 */
export function BriefEditor({
  brief,
  editable,
  onChange,
}: {
  brief: Brief | null
  editable: boolean
  onChange: (brief: Brief) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: brief ?? EMPTY_BRIEF,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap text-sm outline-none',
          editable && 'min-h-32 rounded-md px-3 py-2',
        ),
        'aria-label': 'Brief',
      },
    },
    onUpdate: ({ editor: updatedEditor }) =>
      onChange(updatedEditor.getJSON() as Brief),
  })

  // Re-render the toolbar when the selection's formatting changes.
  const active = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor.isActive('bold'),
      italic: currentEditor.isActive('italic'),
      heading: currentEditor.isActive('heading', { level: 2 }),
      bulletList: currentEditor.isActive('bulletList'),
      orderedList: currentEditor.isActive('orderedList'),
      blockquote: currentEditor.isActive('blockquote'),
    }),
  })

  const tools = [
    {
      label: 'Bold',
      icon: Bold,
      isActive: active.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      icon: Italic,
      isActive: active.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Heading',
      icon: Heading2,
      isActive: active.heading,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'Bullet list',
      icon: List,
      isActive: active.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Numbered list',
      icon: ListOrdered,
      isActive: active.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Quote',
      icon: Quote,
      isActive: active.blockquote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ]

  return (
    <div
      className={cn(
        editable &&
          'rounded-lg border focus-within:ring-2 focus-within:ring-ring/50',
      )}
    >
      {editable && (
        <div className="flex gap-0.5 border-b p-1">
          {tools.map((tool) => (
            <Button
              key={tool.label}
              type="button"
              size="icon-sm"
              variant={tool.isActive ? 'secondary' : 'ghost'}
              aria-label={tool.label}
              aria-pressed={tool.isActive}
              // Keep focus in the editor while using the toolbar.
              onMouseDown={(event) => event.preventDefault()}
              onClick={tool.run}
            >
              <tool.icon />
            </Button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
