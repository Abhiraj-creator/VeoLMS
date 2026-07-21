import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TipTapEditor({ value, onChange, placeholder = 'Write description...' }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[150px] outline-none px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)]',
      },
    },
  })

  // Synchronize external value changes if needed (e.g., reset, loaded data)
  // To avoid cursor jumping, we only set content if it differs from current editor HTML
  if (editor && editor.getHTML() !== value && value !== undefined) {
    // Only update if editor is not focused (so typing isn't interrupted)
    if (!editor.isFocused) {
      editor.commands.setContent(value)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden focus-within:border-[var(--accent)] transition-all">
      {/* Menu Bar */}
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] bg-[var(--surface)] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('bold') ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('italic') ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-[1px] bg-[var(--border)] mx-1 self-stretch" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('heading', { level: 1 }) ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('heading', { level: 3 }) ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-[1px] bg-[var(--border)] mx-1 self-stretch" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('bulletList') ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('orderedList') ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${
            editor.isActive('blockquote') ? 'bg-[var(--border)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-[1px] bg-[var(--border)] mx-1 self-stretch flex-grow" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}
