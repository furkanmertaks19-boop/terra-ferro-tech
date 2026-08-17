"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Uzun açıklama..." }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  if (!editor) return <div className="admin-input min-h-32" />;

  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--admin-border-strong)] bg-[var(--admin-bg-3)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--admin-border)] p-2">
        {(
          [
            { label: "Başlık", run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
            { label: "B", run: () => editor.chain().focus().toggleBold().run() },
            { label: "Liste", run: () => editor.chain().focus().toggleBulletList().run() },
          ] as const
        ).map((item) => (
          <button key={item.label} type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" onClick={item.run}>
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn-ghost min-h-8 px-2"
          onClick={() => {
            const url = window.prompt("Bağlantı URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} className="prose-admin px-3 py-2 text-sm [&_.tiptap]:min-h-36 [&_.tiptap]:outline-none" />
    </div>
  );
}
