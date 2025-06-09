'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Note {
  id: string;
  text: string;
  completed: boolean;
  datetime: string;
  comments?: string;
}

interface TaskItemWithDateTimeProps {
  note: Note;
  onDelete: () => void;
  onUpdate: (updatedNote: Partial<Note>) => void;
  isDark: boolean;
}

export default function TaskItemWithDateTime({
  note,
  onDelete,
  onUpdate,
  isDark,
}: TaskItemWithDateTimeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [comments, setComments] = useState(note.comments || '');
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setEditText(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-2 tiptap-editor',
      },
      handleKeyDown: (view, event) => {
        // Prevent any event interference with spacebar
        return false;
      },
    },
    editable: true,
    immediatelyRender: false,
    enableInputRules: true,
    enablePasteRules: true,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editText !== editor.getHTML()) {
      editor.commands.setContent(editText);
    }
  }, [editor]);

  const handleSubmit = () => {
    if (editText.trim()) {
      onUpdate({ text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ datetime: e.target.value });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComments = e.target.value;
    setComments(newComments);
    onUpdate({ comments: newComments });
  };

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={note.completed}
          onChange={(e) => onUpdate({ completed: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        
        <div className="flex-1">
          {isEditing ? (
            <div className="mb-4">
              <div className={`bg-white rounded-lg p-4 ${isDark ? 'text-black' : ''}`}>
                {isMounted && editor && (
                  <EditorContent editor={editor} />
                )}
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isDark ? 'bg-primary-dark hover:bg-red-700' : 'bg-primary-light hover:bg-green-500'
                  } transition-colors`}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className={`cursor-pointer prose max-w-none ${note.completed ? 'line-through opacity-50' : ''}`}
              dangerouslySetInnerHTML={{ __html: note.text }}
            />
          )}
          
          <div className="mt-4 space-y-2">
            <input
              type="datetime-local"
              value={note.datetime.slice(0, 16)}
              onChange={handleDateTimeChange}
              className={`px-2 py-1 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            />
            
            <textarea
              value={comments}
              onChange={handleCommentsChange}
              placeholder="Add comments..."
              className={`w-full px-2 py-1 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              } resize-y min-h-[2.5rem]`}
              rows={2}
            />
          </div>
        </div>
        
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-600 p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 