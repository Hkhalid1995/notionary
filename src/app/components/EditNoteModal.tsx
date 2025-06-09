'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { v4 as uuidv4 } from 'uuid';
import { Note, TodoItem } from './ClientPage';
import NotionaryLogo from './NotionaryLogo';

interface EditNoteModalProps {
  note: Note;
  isDark: boolean;
  onClose: () => void;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
}

export default function EditNoteModal({ note, isDark, onClose, onUpdate }: EditNoteModalProps) {
  const [title, setTitle] = useState(note.title);
  const [color, setColor] = useState(note.color);
  const [todos, setTodos] = useState<TodoItem[]>(note.todos);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: note.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-4 tiptap-editor',
      },
      handleKeyDown: (view, event) => {
        // Prevent any event interference with spacebar
        return false;
      },
    },
    enableInputRules: true,
    enablePasteRules: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(note.id, {
      title: title.trim(),
      content: editor?.getHTML() || '',
      todos: todos,
      color: color,
    });
    onClose();
  };

  const addTodo = () => {
    const newTodo: TodoItem = {
      id: uuidv4(),
      completed: false,
      description: '',
      deadline: new Date().toISOString().slice(0, 16),
      comments: '',
      precedingTaskId: '',
      reminderTime: '15'
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const updateTodo = (todoId: string, updates: Partial<TodoItem>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (todoId: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const colors = [
    '#FFFFFF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E5E7EB', '#F3E8FF', '#FED7D7'
  ];

  const textColors = [
    '#000000', '#DC2626', '#EA580C', '#D97706', '#65A30D', 
    '#059669', '#0891B2', '#2563EB', '#7C3AED', '#C026D3', '#E11D48'
  ];

  const highlightColors = [
    '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#F3E8FF', '#FED7D7'
  ];

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Monaco'
  ];

  const isColorDark = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  };

  const getContrastTextColor = (bgColor: string) => {
    return isColorDark(bgColor) ? '#FFFFFF' : '#000000';
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border-2 ${
        isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <NotionaryLogo size="sm" showText={false} />
              <h2 className="text-3xl font-bold">✏️ Edit Note</h2>
            </div>
            <button 
              onClick={onClose}
              className={`text-2xl p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title & Color Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Note Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your note title..."
                required
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Note Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-105 ${
                      color === colorOption 
                        ? 'border-blue-500 scale-110 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  >
                    {color === colorOption && (
                      <span 
                        className="text-lg font-bold" 
                        style={{ color: getContrastTextColor(colorOption) }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Content
            </label>
            
            {/* Enhanced Editor Toolbar */}
            <div className={`p-3 border rounded-t-lg ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex flex-wrap gap-2">
                {/* Font Family */}
                <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isDark ? '#9CA3AF' : '#6B7280' }}>
                  <select
                    onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
                    className={`text-xs px-2 py-1 rounded border ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-gray-300' 
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <option value="">Font</option>
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                {/* Basic Formatting */}
                <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isDark ? '#9CA3AF' : '#6B7280' }}>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                      editor?.isActive('bold') 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded text-xs italic transition-colors ${
                      editor?.isActive('italic') 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      editor?.isActive('strike') 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    S̶
                  </button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isDark ? '#9CA3AF' : '#6B7280' }}>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                      editor?.isActive('heading', { level: 1 }) 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                      editor?.isActive('heading', { level: 2 }) 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    H2
                  </button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isDark ? '#9CA3AF' : '#6B7280' }}>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      editor?.isActive('bulletList') 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      editor?.isActive('orderedList') 
                        ? 'bg-blue-500 text-white' 
                        : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    1.
                  </button>
                </div>

                {/* Text Colors */}
                <div className="relative group">
                  <button
                    type="button"
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    A
                  </button>
                  <div className={`absolute top-8 left-0 hidden group-hover:flex p-2 rounded-lg shadow-lg border z-20 ${
                    isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="grid grid-cols-6 gap-1">
                      {textColors.map(textColor => (
                        <button
                          key={textColor}
                          type="button"
                          onClick={() => editor?.chain().focus().setColor(textColor).run()}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: textColor }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Link */}
                <button
                  type="button"
                  onClick={setLink}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    editor?.isActive('link') 
                      ? 'bg-blue-500 text-white' 
                      : isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔗
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className={`border border-t-0 rounded-b-lg ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}>
              <EditorContent 
                editor={editor}
                className={`min-h-[200px] p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>

          {/* Todos Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tasks & Todos ({todos.length})
              </label>
              <button
                type="button"
                onClick={addTodo}
                className={`px-3 py-1 text-sm rounded ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                + Add Task
              </button>
            </div>

            {todos.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {todos.map((todo, index) => (
                  <div key={todo.id} className={`
                    p-3 rounded-lg border
                    ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
                    ${todo.precedingTaskId ? 'border-l-4 border-l-orange-400' : ''}
                  `}>
                    <div className="flex items-start gap-2">
                      <span className={`
                        text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-1
                        ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}
                      `}>
                        {index + 1}
                      </span>
                      
                      {/* Dependency status indicator */}
                      {todo.precedingTaskId && (
                        <span className="text-xs text-orange-500 mt-1.5" title="Has dependency">
                          ⛓️
                        </span>
                      )}
                      
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
                        className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={todo.description}
                          onChange={(e) => updateTodo(todo.id, { description: e.target.value })}
                          className={`
                            w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-400
                            ${isDark ? 'text-white' : 'text-gray-900'}
                          `}
                          placeholder="Task description..."
                        />

                        <input
                          type="datetime-local"
                          value={todo.deadline}
                          onChange={(e) => updateTodo(todo.id, { deadline: e.target.value })}
                          className={`
                            w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400
                            ${isDark ? 'text-white' : 'text-gray-900'}
                          `}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Depends on Task:
                            </label>
                            <select
                              value={todo.precedingTaskId || ''}
                              onChange={(e) => updateTodo(todo.id, { precedingTaskId: e.target.value })}
                              className={`
                                w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400
                                ${isDark ? 'text-white' : 'text-gray-900'}
                              `}
                            >
                              <option value="">No dependency</option>
                              {todos
                                .filter(t => t.id !== todo.id) // Don't allow self-dependency
                                .map((t, idx) => (
                                  <option key={t.id} value={t.id}>
                                    Task {todos.findIndex(task => task.id === t.id) + 1}: {t.description || 'Untitled task'}
                                  </option>
                                ))
                              }
                            </select>
                            {todo.precedingTaskId && (
                              <div className="text-xs text-orange-600 mt-1">
                                ⚠️ Must complete Task {todos.findIndex(t => t.id === todo.precedingTaskId) + 1} first
                              </div>
                            )}
                          </div>

                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Reminder:
                            </label>
                            <select
                              value={todo.reminderTime || '15'}
                              onChange={(e) => updateTodo(todo.id, { reminderTime: e.target.value })}
                              className={`
                                w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400
                                ${isDark ? 'text-white' : 'text-gray-900'}
                              `}
                            >
                              <option value="5">5 min before</option>
                              <option value="15">15 min before</option>
                              <option value="30">30 min before</option>
                              <option value="60">1 hour before</option>
                              <option value="1440">1 day before</option>
                              <option value="10080">1 week before</option>
                            </select>
                          </div>
                        </div>

                        <textarea
                          value={todo.comments}
                          onChange={(e) => updateTodo(todo.id, { comments: e.target.value })}
                          className={`
                            w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none
                            ${isDark ? 'text-white' : 'text-gray-900'}
                          `}
                          placeholder="Additional comments..."
                          rows={2}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Update Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 