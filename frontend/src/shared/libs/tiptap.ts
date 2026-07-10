import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export const tiptapExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: 'Write the lesson content...',
  }),
]
