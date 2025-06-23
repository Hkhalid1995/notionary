'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Note, Group } from './ClientPage';
import NoteCard from './NoteCard';

interface NoteGroupProps {
  group: Group;
  notes: Note[];
  isDark: boolean;
  draggedNoteId: string | null;
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenNote?: (noteId: string) => void;
  colors: string[];
  isWorkspaceView?: boolean;
}

function NoteGroup({
  group,
  notes,
  isDark,
  draggedNoteId,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateNote,
  onDeleteNote,
  onOpenNote,
  colors,
  isWorkspaceView = false
}: NoteGroupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(group.name);
  const [showFullView, setShowFullView] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-collapse when clicking outside (smartphone-like behavior)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isWorkspaceView && showFullView && groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setShowFullView(false);
      }
      // Close color dropdown when clicking outside
      if (showColorDropdown && colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWorkspaceView, showFullView, showColorDropdown]);

  const handleNameSave = () => {
    onUpdateGroup(group.id, { name: editingName });
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    onUpdateGroup(group.id, { color });
    setShowColorDropdown(false);
  };

  const toggleExpanded = () => {
    if (isWorkspaceView) {
      setShowFullView(!showFullView);
    } else {
      onUpdateGroup(group.id, { isExpanded: !group.isExpanded });
    }
  };

  const getSummaryText = () => {
    if (notes.length === 0) return 'Empty group';
    if (notes.length === 1) return `${notes[0].title.slice(0, 30)}${notes[0].title.length > 30 ? '...' : ''}`;
    return `${notes.length} notes`;
  };

  const getPreviewNotes = () => {
    return notes.slice(0, 3); // Show first 3 notes as preview
  };

  // Compact workspace view (like smartphone app folder)
  if (isWorkspaceView && !showFullView) {
    return (
      <div ref={groupRef}>
        {/* Compact folder view */}
        <div 
          className={`relative cursor-pointer transition-all duration-200 hover:scale-105`}
          onClick={toggleExpanded}
        >
          {/* Folder Background - More refined styling */}
          <div 
            className={`w-full h-52 rounded-3xl shadow-xl border-2 transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-gray-500 hover:shadow-2xl' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:border-gray-400 hover:shadow-2xl'
            }`}
          >
            {/* Header with refined color accent */}
            <div 
              className={`p-4 border-b rounded-t-3xl ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${group.color}20, ${group.color}10)`,
                borderLeft: `6px solid ${group.color}`
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-base truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  📁 {group.name}
                </h3>
                <span 
                  className={`text-sm px-3 py-1 rounded-full font-semibold shadow-sm`}
                  style={{ 
                    backgroundColor: group.color + '30',
                    color: isDark ? '#fff' : '#000',
                    border: `2px solid ${group.color}40`
                  }}
                >
                  {notes.length}
                </span>
              </div>
            </div>

            {/* Preview Grid - Enhanced with better drag and drop */}
            <div className="p-4">
              <Droppable droppableId={`group-${group.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`grid grid-cols-3 gap-3 h-28 transition-all duration-300 ${
                      snapshot.isDraggingOver 
                        ? 'bg-blue-100 dark:bg-blue-900/40 rounded-2xl p-2 border-2 border-blue-400 shadow-lg' 
                        : ''
                    }`}
                  >
                    {getPreviewNotes().map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-xl border-2 text-xs p-2 overflow-hidden transition-all duration-300 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            } ${
                              snapshot.isDragging 
                                ? 'transform rotate-3 scale-110 z-50 shadow-2xl' 
                                : 'hover:scale-105 cursor-grab active:cursor-grabbing'
                            }`}
                            style={{ 
                              borderLeft: `4px solid ${note.color}`,
                              ...provided.draggableProps.style
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenNote) {
                                onOpenNote(note.id);
                              }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className={`font-semibold truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {note.title.slice(0, 10)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {/* Show "+" for additional notes */}
                    {notes.length > 3 && (
                      <div className={`rounded-xl border-2 text-xs p-2 flex items-center justify-center font-semibold ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-300' 
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}>
                        +{notes.length - 3}
                      </div>
                    )}
                    
                    {/* Hidden draggable items for notes beyond the first 3 */}
                    {notes.slice(3).map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index + 3}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="absolute opacity-0 pointer-events-none"
                            style={provided.draggableProps.style}
                          >
                            <div className="w-1 h-1" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Summary Text - Enhanced */}
            <div className="px-4 pb-3">
              <p className={`text-sm text-center font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {getSummaryText()}
              </p>
              
              <p className={`text-xs text-center mt-2 opacity-80 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                📱 Drag to move • Click to expand
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full detailed view (when expanded or not in workspace)
  return (
    <div ref={groupRef} className={`rounded-3xl shadow-xl border-2 transition-all duration-300 ${
      isDark 
        ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' 
        : 'border-gray-300 bg-gradient-to-br from-white to-gray-50'
    }`}>
      {/* Header - Modernized and enhanced */}
      <div 
        className={`p-4 border-b rounded-t-3xl transition-all duration-300 ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderLeft: `8px solid ${group.color}`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`} style={{color: group.color}}>
              {notes.length}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className={`text-xl font-bold p-1 rounded-md transition-all duration-200 ${
                    isDark ? 'bg-gray-700 text-white focus:ring-2 focus:ring-blue-500' : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                  autoFocus
                />
              ) : (
                <h2 
                  className={`text-xl font-bold cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}
                  onClick={() => setIsEditing(true)}
                >
                  {group.name}
                </h2>
              )}
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {getSummaryText()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Color Picker */}
            <div className="relative" ref={colorDropdownRef}>
              <button
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: group.color }} />
              </button>
              {showColorDropdown && (
                <div className={`absolute top-12 right-0 p-2 rounded-xl shadow-2xl z-20 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-125"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 text-red-500 hover:bg-red-500 hover:text-white hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            {/* Collapse Button */}
            <button
              onClick={toggleExpanded}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body: List of notes */}
      <div className="p-4">
        <Droppable droppableId={`group-${group.id}`} type="NOTE">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 transition-all duration-300 rounded-2xl p-2 ${
                snapshot.isDraggingOver 
                  ? isDark ? 'bg-blue-900/40' : 'bg-blue-100'
                  : ''
              }`}
            >
              {notes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-300 ${
                        snapshot.isDragging ? 'transform rotate-2 scale-105 z-50 shadow-2xl' : 'hover:scale-102'
                      }`}
                    >
                      <NoteCard
                        note={note}
                        isDark={isDark}
                        isDragging={snapshot.isDragging}
                        onUpdate={onUpdateNote}
                        onDelete={onDeleteNote}
                        isInGroup={true}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Footer dropzone */}
      <div className="p-4 border-t border-dashed rounded-b-3xl" style={{borderColor: isDark ? '#4A5568' : '#CBD5E0'}}>
        <Droppable droppableId={`group-footer-${group.id}`} type="NOTE">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`w-full text-center py-4 rounded-xl transition-all duration-300 ${
                snapshot.isDraggingOver
                  ? isDark ? 'bg-green-900/50' : 'bg-green-100'
                  : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}
            >
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                + Drag other notes here to add
              </p>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

export default memo(NoteGroup); 