'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import { Note, TodoItem } from './ClientPage';
// import TodoItemComponent from './TodoItemComponent';
import { Droppable } from '@hello-pangea/dnd';
import EditNoteModal from './EditNoteModal';

interface NoteCardProps {
  note: Note;
  isDark: boolean;
  isDragging: boolean;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  isInGroup?: boolean;
}

export default function NoteCard({ note, isDark, isDragging, onUpdate, onDelete, isInGroup = false }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [showTodos, setShowTodos] = useState(true);
  const [expandedTodos, setExpandedTodos] = useState<Record<string, boolean>>({});
  const [showFormatting, setShowFormatting] = useState(false);

  // Function to determine if color is dark
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

  const textColor = getContrastTextColor(note.color || '#FFFFFF');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setEditContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-[80px] p-3 tiptap-editor ${
          isColorDark(note.color || '#FFFFFF') ? 'text-white' : 'text-gray-900'
        }`,
        style: `color: ${textColor}; background-color: ${isColorDark(note.color || '#FFFFFF') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};`,
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
    if (editor && !editor.isDestroyed && note.content && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content);
      setEditContent(note.content);
    }
  }, [editor, note.content]);

  const handleSave = () => {
    onUpdate(note.id, {
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
    setShowFormatting(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
    setShowFormatting(false);
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(note.content);
    }
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

  const addTodo = () => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      completed: false,
      description: '',
      deadline: new Date().toISOString().slice(0, 16),
      comments: '',
      precedingTaskId: '',
      reminderTime: '15'
    };
    onUpdate(note.id, {
      todos: [...note.todos, newTodo]
    });
  };

  const updateTodo = (todoId: string, updates: Partial<TodoItem>) => {
    const updatedTodos = note.todos.map(todo =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    );
    onUpdate(note.id, { todos: updatedTodos });
  };

  const deleteTodo = (todoId: string) => {
    const updatedTodos = note.todos.filter(todo => todo.id !== todoId);
    onUpdate(note.id, { todos: updatedTodos });
  };

  const toggleTodoExpansion = (todoId: string) => {
    setExpandedTodos(prev => ({
      ...prev,
      [todoId]: !prev[todoId]
    }));
  };

  const changeNoteColor = (color: string) => {
    onUpdate(note.id, { color });
  };

  const colors = [
    '#FFFFFF', // White
    '#FEF3C7', // Yellow
    '#DBEAFE', // Blue
    '#D1FAE5', // Green
    '#FCE7F3', // Pink
    '#E5E7EB', // Gray
    '#F3E8FF', // Purple
    '#FED7D7', // Red
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

  return (
    <>
    <Droppable droppableId={`note-${note.id}`}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          data-note-id={note.id}
          className={`
            w-full max-w-sm mx-auto rounded-xl shadow-lg transition-all duration-200 transform border
            ${isDragging ? 'rotate-3 scale-105 shadow-2xl z-50' : 'hover:shadow-xl'}
            ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''}
          `}
          style={{ 
            backgroundColor: note.color || '#FFFFFF',
            color: textColor,
            borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#D1D5DB'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB' }}>
            <div className="flex justify-between items-start">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b-2 border-blue-400 focus:outline-none flex-1"
                  style={{ color: textColor, borderBottomColor: '#60A5FA' }}
                  placeholder="Note title..."
                />
              ) : (
                <h3 className="text-lg font-semibold truncate" style={{ color: textColor }}>
                  {note.title || 'Untitled Note'}
                </h3>
              )}
              <div className="flex gap-2 ml-2">
                {/* Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowFormatting(!showFormatting)}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                    style={{ color: textColor }}
                  >
                    🎨
                  </button>
                  {showFormatting && (
                    <div className={`absolute top-8 right-0 z-20 p-2 rounded-lg shadow-lg border ${
                      isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex gap-1 mb-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => changeNoteColor(color)}
                            className={`w-6 h-6 rounded border-2 transition-all ${
                              note.color === color ? 'scale-110 border-blue-500' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-700 p-1"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                      style={{ color: textColor }}
                      title="Quick Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                      style={{ color: textColor }}
                      title="Full Screen Edit"
                    >
                      📝
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {isEditing ? (
              <div>
                {/* Comprehensive Formatting Toolbar */}
                <div className="mb-3 p-2 rounded border overflow-x-auto" style={{ 
                  borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                  backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                  <div className="flex flex-wrap gap-1 min-w-max">
                    {/* Basic Formatting */}
                    <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#9CA3AF' : '#6B7280' }}>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          editor?.isActive('bold') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('bold') ? 'white' : textColor }}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`px-2 py-1 rounded text-xs italic transition-colors ${
                          editor?.isActive('italic') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('italic') ? 'white' : textColor }}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className={`px-2 py-1 rounded text-xs underline transition-colors ${
                          editor?.isActive('underline') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('underline') ? 'white' : textColor }}
                      >
                        U
                      </button>
                    </div>

                    {/* Font Family */}
                    <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#9CA3AF' : '#6B7280' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value === '') {
                            editor?.chain().focus().unsetFontFamily().run();
                          } else {
                            editor?.chain().focus().setFontFamily(e.target.value).run();
                          }
                        }}
                        className="px-1 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: textColor,
                          borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB'
                        }}
                      >
                        <option value="">Font</option>
                        {fontFamilies.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    {/* Headings */}
                    <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#9CA3AF' : '#6B7280' }}>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                          editor?.isActive('heading', { level: 1 }) 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('heading', { level: 1 }) ? 'white' : textColor }}
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                          editor?.isActive('heading', { level: 2 }) 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('heading', { level: 2 }) ? 'white' : textColor }}
                      >
                        H2
                      </button>
                    </div>

                    {/* Lists & Alignment */}
                    <div className="flex gap-1 border-r pr-2 mr-2" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#9CA3AF' : '#6B7280' }}>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          editor?.isActive('bulletList') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('bulletList') ? 'white' : textColor }}
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          editor?.isActive('orderedList') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('orderedList') ? 'white' : textColor }}
                      >
                        1.
                      </button>
                    </div>

                    {/* Colors & Link */}
                    <div className="flex gap-1">
                      <div className="relative group">
                        <button
                          type="button"
                          className="px-2 py-1 rounded text-xs transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: textColor }}
                        >
                          A
                        </button>
                        <div className="absolute top-8 left-0 hidden group-hover:flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 gap-1 flex-wrap w-40 z-20">
                          {textColors.slice(0, 8).map(textColor => (
                            <button
                              key={textColor}
                              type="button"
                              onClick={() => editor?.chain().focus().setColor(textColor).run()}
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: textColor }}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={setLink}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          editor?.isActive('link') 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                        style={{ color: editor?.isActive('link') ? 'white' : textColor }}
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                </div>

                {/* Editor */}
                <div className="border rounded" style={{ 
                  borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                  backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                }}>
                  <EditorContent 
                    editor={editor} 
                    style={{ color: textColor }}
                  />
                </div>
              </div>
            ) : (
              note.content && (
                <div
                  onClick={() => setShowEditModal(true)}
                  className="cursor-pointer prose prose-sm max-w-none hover:opacity-80 transition-opacity"
                  style={{ color: textColor }}
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              )
            )}

            {/* Todos Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => setShowTodos(!showTodos)}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: textColor }}
                >
                  📋 Todos ({note.todos.length}) {showTodos ? '▼' : '▶'}
                </button>
                <button
                  onClick={addTodo}
                  className="px-2 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  + Add Todo
                </button>
              </div>

              {showTodos && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {note.todos.map((todo, index) => {
                    const isExpanded = expandedTodos[todo.id];
                    const deadline = new Date(todo.deadline);
                    const isOverdue = deadline < new Date() && !todo.completed;
                    
                    return (
                      <div 
                        key={todo.id} 
                        className={`text-xs p-2 rounded border transition-all ${
                          todo.precedingTaskId ? 'border-l-4 border-l-orange-400' : ''
                        } ${isExpanded ? 'bg-opacity-20' : 'hover:bg-opacity-10'}`}
                        style={{ 
                          backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                        }}
                      >
                        {/* Summary Line */}
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleTodoExpansion(todo.id)}
                        >
                          <span className="text-xs font-mono w-4 h-4 flex items-center justify-center rounded bg-gray-200 text-gray-700 flex-shrink-0">
                            {index + 1}
                          </span>
                          
                          {todo.precedingTaskId && (
                            <span className="text-xs text-orange-500" title="Has dependency">⛓️</span>
                          )}
                          
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateTodo(todo.id, { completed: e.target.checked });
                            }}
                            className="h-3 w-3 rounded"
                          />

                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span 
                              className={`text-xs truncate mr-2 ${todo.completed ? 'line-through opacity-60' : ''}`}
                              style={{ color: textColor }}
                            >
                              {todo.description || 'Untitled task'}
                            </span>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span 
                                className={`text-xs ${isOverdue ? 'text-red-500' : todo.completed ? 'text-green-500' : 'opacity-60'}`}
                                style={{ color: isOverdue ? '#EF4444' : todo.completed ? '#10B981' : textColor }}
                              >
                                {deadline.toLocaleDateString()}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTodo(todo.id);
                                }}
                                className="text-red-500 hover:text-red-600 p-0.5 opacity-50 hover:opacity-100"
                                style={{ fontSize: '10px' }}
                              >
                                🗑️
                              </button>
                              
                              <span className="text-xs opacity-50" style={{ color: textColor }}>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-3 pl-6 space-y-2 border-t pt-2" style={{ borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB' }}>
                            <div>
                              <label className="text-xs opacity-70" style={{ color: textColor }}>Task Description:</label>
                              <input
                                type="text"
                                value={todo.description}
                                onChange={(e) => updateTodo(todo.id, { description: e.target.value })}
                                className="w-full text-xs bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-400 mt-1"
                                style={{ color: textColor }}
                                placeholder="Enter task description..."
                              />
                            </div>

                            <div>
                              <label className="text-xs opacity-70" style={{ color: textColor }}>Deadline:</label>
                              <input
                                type="datetime-local"
                                value={todo.deadline}
                                onChange={(e) => updateTodo(todo.id, { deadline: e.target.value })}
                                className="w-full text-xs bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 mt-1"
                                style={{ 
                                  backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                                  color: textColor
                                }}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs opacity-70" style={{ color: textColor }}>Depends on:</label>
                                <select
                                  value={todo.precedingTaskId || ''}
                                  onChange={(e) => updateTodo(todo.id, { precedingTaskId: e.target.value })}
                                  className="w-full text-xs bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 mt-1"
                                  style={{ 
                                    backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                                    color: textColor
                                  }}
                                >
                                  <option value="">No dependency</option>
                                  {note.todos
                                    .filter(t => t.id !== todo.id)
                                    .map((t, idx) => (
                                      <option key={t.id} value={t.id}>
                                        Task {note.todos.findIndex(task => task.id === t.id) + 1}: {t.description || 'Untitled'}
                                      </option>
                                    ))
                                  }
                                </select>
                                {todo.precedingTaskId && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    ⚠️ Must complete Task {note.todos.findIndex(t => t.id === todo.precedingTaskId) + 1} first
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="text-xs opacity-70" style={{ color: textColor }}>Reminder:</label>
                                <select
                                  value={todo.reminderTime || '15'}
                                  onChange={(e) => updateTodo(todo.id, { reminderTime: e.target.value })}
                                  className="w-full text-xs bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 mt-1"
                                  style={{ 
                                    backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                                    color: textColor
                                  }}
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

                            <div>
                              <label className="text-xs opacity-70" style={{ color: textColor }}>Comments:</label>
                              <textarea
                                value={todo.comments}
                                onChange={(e) => updateTodo(todo.id, { comments: e.target.value })}
                                className="w-full text-xs bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none mt-1"
                                style={{ 
                                  backgroundColor: isColorDark(note.color || '#FFFFFF') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB',
                                  color: textColor
                                }}
                                placeholder="Additional comments..."
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {note.todos.length === 0 && (
                    <p className="text-xs text-center py-4 opacity-60" style={{ color: textColor }}>
                      No todos yet. Click "Add Todo" to get started!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div 
            className="px-4 py-2 text-xs border-t opacity-60" 
            style={{ 
              color: textColor,
              borderColor: isColorDark(note.color || '#FFFFFF') ? '#374151' : '#E5E7EB'
            }}
          >
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </div>

          {provided.placeholder}
        </div>
      )}
    </Droppable>

    {/* Edit Modal */}
    {showEditModal && (
      <EditNoteModal
        note={note}
        isDark={isDark}
        onClose={() => setShowEditModal(false)}
        onUpdate={onUpdate}
      />
    )}
    </>
  );
} 