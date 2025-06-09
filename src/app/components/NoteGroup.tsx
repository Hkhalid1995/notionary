'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function NoteGroup({
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
          {/* Folder Background - Fixed styling */}
          <div 
            className={`w-full h-48 rounded-2xl shadow-lg border-2 transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 hover:border-gray-500' 
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            {/* Header with color accent - Fixed */}
            <div 
              className={`p-3 border-b rounded-t-2xl ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${group.color}15, ${group.color}05)`,
                borderLeft: `4px solid ${group.color}`
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  📁 {group.name}
                </h3>
                <span 
                  className={`text-xs px-2 py-1 rounded-full font-medium`}
                  style={{ 
                    backgroundColor: group.color + '20',
                    color: isDark ? '#fff' : '#000'
                  }}
                >
                  {notes.length}
                </span>
              </div>
            </div>

            {/* Preview Grid - Improved */}
            <div className="p-3">
              <Droppable droppableId={`group-${group.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`grid grid-cols-3 gap-2 h-24 ${
                      snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900 rounded-lg p-1' : ''
                    }`}
                  >
                    {getPreviewNotes().map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-lg border text-xs p-1 overflow-hidden transition-all duration-200 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-gray-50 border-gray-200'
                            } ${
                              snapshot.isDragging 
                                ? 'transform rotate-2 scale-110 z-50 shadow-2xl' 
                                : 'hover:scale-105 cursor-grab active:cursor-grabbing'
                            }`}
                            style={{ 
                              borderLeft: `3px solid ${note.color}`,
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
                            <div className={`font-medium truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {note.title.slice(0, 8)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {/* Show "+" for additional notes */}
                    {notes.length > 3 && (
                      <div className={`rounded-lg border text-xs p-1 flex items-center justify-center ${
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

            {/* Summary Text */}
            <div className="px-3 pb-2">
              <p className={`text-xs text-center ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getSummaryText()}
              </p>
              
              <p className={`text-xs text-center mt-1 opacity-70 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                📱 Drag preview to move • Click to expand
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full detailed view (when expanded or not in workspace)
  return (
    <div ref={groupRef} className={`rounded-2xl shadow-lg border-2 transition-all duration-200 ${
      isDark 
        ? 'border-gray-600 bg-gray-800' 
        : 'border-gray-300 bg-white'
    }`}>
      {/* Header - Reorganized and improved */}
      <div 
        className={`p-4 border-b rounded-t-2xl ${
          isDark ? 'border-gray-600' : 'border-gray-200'
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${group.color}10, ${group.color}05)`,
          borderLeft: `4px solid ${group.color}`
        }}
      >
        {/* Title Section */}
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className={`flex-1 px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                autoFocus
              />
              <button
                onClick={handleNameSave}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                ✓ Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingName(group.name);
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                ✗ Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <h3 className={`font-bold text-xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                📁 {group.name}
              </h3>
              <span 
                className={`text-sm px-3 py-1 rounded-full font-medium`}
                style={{ 
                  backgroundColor: group.color + '20',
                  color: isDark ? '#fff' : '#000'
                }}
              >
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          )}

          {/* Auto-collapse info for workspace view */}
          {isWorkspaceView && (
            <div className={`text-xs px-3 py-1 rounded-full ${
              isDark 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              📱 Click outside to compact
            </div>
          )}
        </div>

        {/* Controls Section - Reorganized */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Edit Name Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>✏️</span>
                <span className="text-sm">Rename</span>
              </button>
            )}

            {/* Color Picker Dropdown */}
            <div className="relative" ref={colorDropdownRef}>
              <button
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-current"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm">Color</span>
                <span className={`transition-transform ${showColorDropdown ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Color Dropdown */}
              {showColorDropdown && (
                <div className={`absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg border-2 z-10 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          group.color === color 
                            ? 'border-gray-900 dark:border-white scale-110' 
                            : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Select ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            <span>🗑️</span>
            <span>Delete Group</span>
          </button>
        </div>
      </div>

      {/* Notes Content */}
      <div className="p-4">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📂</div>
            <p className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Empty group - drag notes here
            </p>
          </div>
        ) : (
          <Droppable droppableId={`group-${group.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 transition-all duration-200 ${
                  snapshot.isDraggingOver 
                    ? isDark 
                      ? 'bg-gray-700 rounded-lg p-2' 
                      : 'bg-blue-50 rounded-lg p-2'
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
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'transform rotate-1 scale-105 z-50' : ''
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
        )}
      </div>
    </div>
  );
} 