"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered } from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: number
  showToolbar?: boolean
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  disabled = false,
  minHeight = 200,
  showToolbar = true,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm w-full max-w-none focus:outline-none p-4",
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={`border rounded-md ${disabled ? "opacity-60 bg-muted" : "bg-background"}`}>
      {showToolbar && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            disabled={disabled}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>
      )}
      
      <div style={{ minHeight: `${minHeight}px` }}>
        <EditorContent editor={editor} />
        {editor.isEmpty && (
           <div className="absolute top-[50px] left-4 text-muted-foreground pointer-events-none text-sm">
             {placeholder}
           </div>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor
