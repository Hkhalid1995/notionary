'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import NoteCard from './NoteCard';
import NoteGroup from './NoteGroup';
import CreateNoteModal from './CreateNoteModal';
import EditNoteModal from './EditNoteModal';

export interface TodoItem {
  id: string;
  completed: boolean;
  description: string;
  deadline: string;
  comments: string;
  precedingTaskId?: string; // For task dependencies
  reminderTime?: string; // When to remind before deadline
}

export interface Note {
  id: string;
  title: string;
  content: string;
  todos: TodoItem[];
  color: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string; // Add workspace association
}

export interface Group {
  id: string;
  name: string;
  color: string;
  noteIds: string[];
  isExpanded: boolean; // Changed from isCollapsed to isExpanded for clarity
  workspaceId: string; // Add workspace association
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string; // Add emoji/icon support
  createdAt: string;
  description?: string;
}

export default function ClientPage() {
  const [isDark, setIsDark] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedNotes = localStorage.getItem('notes');
    const savedGroups = localStorage.getItem('groups');
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedCurrentWorkspace = localStorage.getItem('currentWorkspaceId');

    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }

    if (savedWorkspaces) {
      const parsedWorkspaces = JSON.parse(savedWorkspaces);
      setWorkspaces(parsedWorkspaces);
      
      // Set current workspace
      if (savedCurrentWorkspace && parsedWorkspaces.find((w: Workspace) => w.id === savedCurrentWorkspace)) {
        setCurrentWorkspaceId(savedCurrentWorkspace);
      } else if (parsedWorkspaces.length > 0) {
        setCurrentWorkspaceId(parsedWorkspaces[0].id);
      }
    } else {
      // Create default workspace
      const defaultWorkspace: Workspace = {
        id: uuidv4(),
        name: 'My Workspace',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
        description: 'Default workspace'
      };
      setWorkspaces([defaultWorkspace]);
      setCurrentWorkspaceId(defaultWorkspace.id);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('currentWorkspaceId', currentWorkspaceId);
  }, [currentWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const createWorkspace = (name: string, color: string, description?: string, icon?: string) => {
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name,
      color,
      icon,
      description,
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace.id;
  };

  const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(workspace =>
      workspace.id === workspaceId ? { ...workspace, ...updates } : workspace
    ));
  };

  const deleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert('You must have at least one workspace!');
      return;
    }

    // Move notes and groups to another workspace before deleting
    const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    const targetWorkspaceId = remainingWorkspaces[0].id;

    setNotes(prev => prev.map(note =>
      note.workspaceId === workspaceId 
        ? { ...note, workspaceId: targetWorkspaceId }
        : note
    ));

    setGroups(prev => prev.map(group =>
      group.workspaceId === workspaceId 
        ? { ...group, workspaceId: targetWorkspaceId }
        : group
    ));

    setWorkspaces(remainingWorkspaces);
    
    if (currentWorkspaceId === workspaceId) {
      setCurrentWorkspaceId(targetWorkspaceId);
    }
  };

  const createNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => {
    const newNote: Note = {
      id: uuidv4(),
      ...noteData,
      workspaceId: currentWorkspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    // Also remove from groups
    setGroups(prev => prev.map(group => ({
      ...group,
      noteIds: group.noteIds.filter(id => id !== noteId)
    })).filter(group => group.noteIds.length > 0)); // Remove empty groups
  };

  const createGroup = (noteIds: string[], name: string = 'New Group') => {
    const newGroup: Group = {
      id: uuidv4(),
      name,
      color: '#E5E7EB',
      noteIds,
      isExpanded: false,
      workspaceId: currentWorkspaceId,
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    ));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const onDragStart = (start: any) => {
    setDraggedNoteId(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    setDraggedNoteId(null);
    
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Handle dropping on the main workspace (remove from any group)
    if (destination.droppableId === 'workspace') {
      // Remove note from any existing group
      setGroups(prev => prev.map(group => ({
        ...group,
        noteIds: group.noteIds.filter(id => id !== draggableId)
      })).filter(group => group.noteIds.length > 0));
      return;
    }

    // Handle dropping on another note or group to create/join group
    if (destination.droppableId.startsWith('group-') || destination.droppableId.startsWith('note-')) {
      let targetGroupId = '';
      
      if (destination.droppableId.startsWith('note-')) {
        // Dropping on another note - create new group
        const targetNoteId = destination.droppableId.replace('note-', '');
        
        if (targetNoteId !== draggableId) {
          // Remove both notes from any existing groups
          setGroups(prev => prev.map(group => ({
            ...group,
            noteIds: group.noteIds.filter(id => id !== draggableId && id !== targetNoteId)
          })).filter(group => group.noteIds.length > 0));

          // Create new group with both notes
          createGroup([targetNoteId, draggableId], 'New Group');
        }
        return;
      } else {
        // Dropping on existing group
        targetGroupId = destination.droppableId.replace('group-', '');
      }
      
      // Remove note from any existing group first
      setGroups(prev => prev.map(group => ({
        ...group,
        noteIds: group.noteIds.filter(id => id !== draggableId)
      })).filter(group => group.noteIds.length > 0));

      // Add note to the target group
      setGroups(prev => prev.map(group =>
        group.id === targetGroupId
          ? {
              ...group,
              noteIds: [...group.noteIds, draggableId]
            }
          : group
      ));
      return;
    }
  };

  // Get current workspace data
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  
  // Filter notes and groups by current workspace
  const workspaceNotes = notes.filter(note => note.workspaceId === currentWorkspaceId);
  const workspaceGroups = groups.filter(group => group.workspaceId === currentWorkspaceId);

  // Get all items for the unified workspace
  const getAllWorkspaceItems = () => {
    const groupedNoteIds = new Set(workspaceGroups.flatMap(group => group.noteIds));
    const ungroupedNotes = workspaceNotes.filter(note => !groupedNoteIds.has(note.id));
    
    return [
      ...workspaceGroups.map(group => ({ type: 'group', item: group })),
      ...ungroupedNotes.map(note => ({ type: 'note', item: note }))
    ];
  };

  const colors = [
    '#E5E7EB', // Gray
    '#FEF3C7', // Yellow
    '#DBEAFE', // Blue
    '#D1FAE5', // Green
    '#FCE7F3', // Pink
    '#F3E8FF', // Purple
    '#FED7D7', // Red
  ];

  const workspaceColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const workspaceItems = getAllWorkspaceItems();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                📝 Notionary
              </h1>
              
              {/* Workspace Selector */}
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700' 
                    : 'border-gray-300 bg-gray-100'
                }`}>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentWorkspace?.color || '#3B82F6' }}
                  />
                  <select
                    value={currentWorkspaceId}
                    onChange={(e) => setCurrentWorkspaceId(e.target.value)}
                    className={`bg-transparent border-none outline-none text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {workspaces.map(workspace => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  title="Manage workspaces"
                >
                  ⚙️
                </button>
              </div>

              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {workspaceNotes.length} notes • {workspaceGroups.length} groups
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ➕ Add Note
              </button>
              
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Unified Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              📱 {currentWorkspace?.name || 'Workspace'}
            </h2>
            
            {currentWorkspace?.description && (
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {currentWorkspace.description}
              </p>
            )}
          </div>
          
          <Droppable droppableId="workspace" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 rounded-xl transition-all duration-200 min-h-[400px] ${
                  snapshot.isDraggingOver 
                    ? isDark 
                      ? 'bg-gray-800 ring-2 ring-blue-400' 
                      : 'bg-blue-50 ring-2 ring-blue-400'
                    : ''
                }`}
              >
                {workspaceItems.map((item, index) => (
                  <Draggable 
                    key={item.type === 'group' ? `group-${item.item.id}` : `note-${item.item.id}`} 
                    draggableId={item.type === 'group' ? `group-${item.item.id}` : item.item.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'transform rotate-2 scale-105 z-50' : ''
                        }`}
                      >
                        {item.type === 'group' ? (
                          <NoteGroup
                            group={item.item as Group}
                            notes={workspaceNotes.filter(note => (item.item as Group).noteIds.includes(note.id))}
                            isDark={isDark}
                            draggedNoteId={draggedNoteId}
                            onUpdateGroup={updateGroup}
                            onDeleteGroup={deleteGroup}
                            onUpdateNote={updateNote}
                            onDeleteNote={deleteNote}
                            onOpenNote={(noteId: string) => {
                              setEditingNoteId(noteId);
                            }}
                            colors={colors}
                            isWorkspaceView={true}
                          />
                        ) : (
                          <NoteCard
                            note={item.item as Note}
                            isDark={isDark}
                            isDragging={snapshot.isDragging}
                            onUpdate={updateNote}
                            onDelete={deleteNote}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {/* Empty State */}
                {workspaceItems.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className={`text-xl font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      No notes in this workspace yet
                    </h3>
                    <p className={`mb-6 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Create your first note in "{currentWorkspace?.name}"!
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      ➕ Create First Note
                    </button>
                  </div>
                )}
              </div>
            )}
          </Droppable>

          {/* Drag Instructions */}
          {workspaceItems.length > 1 && (
            <div className={`mt-8 p-4 rounded-lg border-2 border-dashed ${
              isDark 
                ? 'border-gray-600 bg-gray-800/50' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <p className={`text-sm text-center ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                📱 <strong>Smartphone-style:</strong> Drag notes onto groups to add them, or drag anywhere in workspace to ungroup. Drag notes onto each other to create new groups. 
                <br />
                <strong>Compact groups:</strong> Drag preview items directly from compact view or click outside to auto-compact.
              </p>
            </div>
          )}
        </DragDropContext>
      </main>

      {/* Create Note Modal */}
      {showCreateModal && (
        <CreateNoteModal
          isDark={isDark}
          onClose={() => setShowCreateModal(false)}
          onCreate={createNote}
        />
      )}

      {/* Workspace Management Modal */}
      {showWorkspaceModal && (
        <WorkspaceModal
          isDark={isDark}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          colors={workspaceColors}
          onClose={() => setShowWorkspaceModal(false)}
          onCreate={createWorkspace}
          onUpdate={updateWorkspace}
          onDelete={deleteWorkspace}
          onSwitch={setCurrentWorkspaceId}
        />
      )}

      {/* Edit Note Modal */}
      {editingNoteId && (
        <EditNoteModal
          note={notes.find(note => note.id === editingNoteId)!}
          isDark={isDark}
          onClose={() => setEditingNoteId(null)}
          onUpdate={updateNote}
        />
      )}
    </div>
  );
}

// Workspace Management Modal Component
interface WorkspaceModalProps {
  isDark: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  colors: string[];
  onClose: () => void;
  onCreate: (name: string, color: string, description?: string, icon?: string) => string;
  onUpdate: (id: string, updates: Partial<Workspace>) => void;
  onDelete: (id: string) => void;
  onSwitch: (id: string) => void;
}

function WorkspaceModal({
  isDark,
  workspaces,
  currentWorkspaceId,
  colors,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onSwitch
}: WorkspaceModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    color: colors[0],
    description: '',
    icon: '📁'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newWorkspace.name.trim()) {
      const id = onCreate(newWorkspace.name, newWorkspace.color, newWorkspace.description, newWorkspace.icon);
      onSwitch(id);
      setNewWorkspace({ name: '', color: colors[0], description: '', icon: '📁' });
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🗂️ Manage Workspaces
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Create New Workspace */}
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
          }`}>
            <h3 className={`font-medium mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              ➕ Create New Workspace
            </h3>
            
            {isCreating ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Workspace name"
                  className={`w-full p-2 rounded border ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  autoFocus
                />
                
                <input
                  type="text"
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className={`w-full p-2 rounded border ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Icon
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['📁', '💼', '🏠', '🎯', '📊', '💡', '🚀', '📝', '🔬', '🎨', '🎮', '📚'].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewWorkspace(prev => ({ ...prev, icon }))}
                          className={`w-10 h-10 rounded-lg border-2 text-lg hover:scale-110 transition-transform ${
                            newWorkspace.icon === icon 
                              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' 
                              : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewWorkspace(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newWorkspace.color === color ? 'border-gray-900' : 'border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ➕ New Workspace
              </button>
            )}
          </div>

          {/* Existing Workspaces */}
          <div className="space-y-3">
            <h3 className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Existing Workspaces
            </h3>
            
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                className={`p-4 rounded-lg border transition-all ${
                  workspace.id === currentWorkspaceId
                    ? isDark 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-blue-500 bg-blue-50'
                    : isDark 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{workspace.icon || '📁'}</span>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: workspace.color }}
                      />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {workspace.name}
                        {workspace.id === currentWorkspaceId && (
                          <span className="ml-2 text-xs text-blue-500">ACTIVE</span>
                        )}
                      </div>
                      {workspace.description && (
                        <div className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {workspace.id !== currentWorkspaceId && (
                      <button
                        onClick={() => onSwitch(workspace.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Switch
                      </button>
                    )}
                    
                    <button
                      onClick={() => setEditingId(editingId === workspace.id ? null : workspace.id)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      ✏️
                    </button>
                    
                    {workspaces.length > 1 && (
                      <button
                        onClick={() => onDelete(workspace.id)}
                        className="px-2 py-1 text-sm text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 